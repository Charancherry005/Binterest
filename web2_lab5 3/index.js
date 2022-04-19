const { ApolloServer, gql } = require("apollo-server");
const uuid = require("uuid");
//const bluebird = require('bluebird');
const redis = require("redis");
const client = redis.createClient();
//const flat = require('flat');
const { default: Axios } = require("axios");
const { data } = require("cheerio/lib/api/attributes");
//bluebird.promisifyAll(redis.RedisClient.prototype);
//bluebird.promisifyAll(redis.Multi.prototype);

const typeDefs = gql`
  type Query {
    unsplashImages(pageNum: Int): [ImagePost]
    binnedImages: [ImagePost]
    userPostedImages: [ImagePost]
    getTopTenBinnedPosts: [ImagePost]
  }

  type ImagePost {
    id: ID!
    url: String!
    posterName: String!
    description: String
    userPosted: Boolean!
    binned: Boolean!
    numBinned: Int!
  }

  type Mutation {
    uploadImage(
      url: String!
      description: String
      posterName: String
    ): ImagePost

    updateImage(
      id: ID!
      url: String
      posterName: String
      description: String
      userPosted: Boolean
      binned: Boolean
      numBinned: Int
    ): ImagePost

    deleteImage(id: ID!): ImagePost
  }
`;

const resolvers = {
  Query: {
    userPostedImages: async () => {
      let returnData = [];
      if (!client.isOpen) await client.connect();
      const data = await client.lRange("userPosted", 0, -1);
      console.log(data);
      for (let err of data) {
        const jsonImageFromRedis = await client.get(err);
        console.log("jsonimg ", jsonImageFromRedis);
        const recomposedImage = JSON.parse(jsonImageFromRedis);
        returnData.push(recomposedImage);
      }
      console.log(returnData);
      return returnData;
    },

    binnedImages: async () => {
      let returnData = [];

      const members = await client.zRange("binnedImages", 0, -1); //async function(err,members){
      if (members.length != 0) {
        for (let err of members) {
          const jsonImageFromRedis = await client.get(err);
          // const recomposedImage = JSON.parse(jsonImageFromRedis);
          if (jsonImageFromRedis)
            returnData.push(JSON.parse(jsonImageFromRedis));
        }
        console.log(returnData);
        return returnData;
      }
      return returnData;
    },
    async unsplashImages(_, args) {
      let returnData = [];
      //let imageData = {};

      try {
        const { data } = await Axios.get(
          "https://api.unsplash.com/photos?page=" +
            args.pageNum +
            "&client_id=ykksdn-OJZeeZYjbUIWonWvQY7uP17t-5VldvNp6t8s"
        );

        let existBin;
        if (!client.isOpen) await client.connect();
        for (let arr of data) {
          let exist = await client.get(arr.id);
          let binnedFlag = exist ? JSON.parse(exist).binned : false;
          returnData.push({
            id: arr.id,
            url: arr.urls.thumb,
            posterName: arr.user.name,
            description: arr.description,
            userPosted: false,
            binned: binnedFlag,
            numBinned: arr.likes,
          });
        }
        //console.log(returnData);
        return returnData;
      } catch (e) {
        console.log(e);
        return null;
      }
    },
    async getTopTenBinnedPosts() {
      let returnData = [];

      const members = await client.zRangeByScore("binnedImages", 0, 9); //async function(err,members){

      if (members.length != 0) {
        for (let err of members) {
          const jsonImageFromRedis = await client.get(err);
          const recomposedImage = JSON.parse(jsonImageFromRedis);
          returnData.push(recomposedImage);
        }
        return returnData;
      }
      return returnData;
    },
  },

  Mutation: {
    async uploadImage(_, args) {
      const redisId = uuid.v4();
      const newImage = {
        id: redisId,
        url: args.url,
        posterName: args.posterName,
        description: args.description,
        userPosted: true,
        binned: false,
        numBinned: 0,
      };

      //  client.rpush('userPostedImages', redisId, (err, _data) => {
      //   if(err) {
      //       return null;
      //   }
      // })

      await client.rPush("userPosted", redisId);

      const jsonBio = JSON.stringify(newImage);
      await client.set(redisId, jsonBio);

      const jsonImageFromRedis = await client.get(redisId);
      const recomposedImage = JSON.parse(jsonImageFromRedis);

      return recomposedImage;
    },

    async updateImage(_, args) {
      let redisId = args.id;
      console.log(args.id, args.binned, args.numBinned);
      if (args.binned) {
        const newImage = {
          id: redisId,
          url: args.url,
          posterName: args.posterName,
          description: args.description,
          userPosted: args.userPosted,
          binned: args.binned,
          numBinned: args.numBinned,
        };
        if (!client.isOpen) await client.connect();
        const jsonBio = JSON.stringify(newImage);
        client.zAdd("binnedImages", { score: args.numBinned, value: redisId });
        await client.del(redisId);
        await client.set(redisId, jsonBio);
        return newImage;
      } else {
        redisId = args.id;

        if (args.userPosted) {
          const newImage1 = {
            id: redisId,
            url: args.url,
            posterName: args.posterName,
            description: args.description,
            userPosted: args.userPosted,
            binned: args.binned,
            numBinned: args.numBinned,
          };

          client.zRem("binnedImages", redisId);

          await client.del(redisId);
          const jsonBio = JSON.stringify(newImage1);
          await client.set(redisId, jsonBio);

          const jsonImageFromRedis = await client.get(redisId);
          const recomposedImage = JSON.parse(jsonImageFromRedis);

          return recomposedImage;
        } else {
          client.zRem("binnedImages", redisId);

          const jsonImageFromRedis = await client.get(redisId);
          const recomposedImage = JSON.parse(jsonImageFromRedis);

          await client.del(redisId);
          return recomposedImage;
        }
      }
    },

    async deleteImage(_, args) {
      const jsonImageFromRedis = await client.get(args.id);
      const recomposedImage = JSON.parse(jsonImageFromRedis);

      client.lRem("userPostedImages", 0, args.id, function (err, data) {
        if (err) {
          return null;
        }
      });

      if (recomposedImage.binned) {
        client.zRem("binnedImages", args.id);
      }
      await client.del(args.id);

      return null;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(` Server ready at ${url}`);
});
