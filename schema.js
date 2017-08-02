const graphql = require('graphql');
const axios = require('axios');
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = graphql;

// In general, each type (UserType, CompanyType etc) is equivalent to an entity in a relational database.
// Instead of foreign keys, we use resolvefunctions that determine how to fetch or get that particular data.

const CompanyType = new GraphQLObjectType({
  name: 'Company',
  // Using an arrowfunction here is to avoid a referenceerror. under users we define a
  // type: new GrapQLList(UserType), but UserType isn't defined until further down.
  // to solve this, we wrat the entire field with an arrow function which returns an object
  // with the properties id, name, description etc, but the code itself isn't executed until
  // after the entire file has been parsed. At that time, UserType is defined.
  fields: () =>({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    users: {
      type: new GraphQLList(UserType),
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`)
        .then(resp => resp.data); // fix to get axios cooperate nicely with graphQL
      }
    }
  })
});

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt},
    company: {
      type: CompanyType,
      // If we look at the database (db.json) we see that each user has a companyId key. This
      // key is accessed via parentValue.companyId and then that entity is fetched. So in the database
      // the companyId is an int specifying which company, whereas in grapQL, that key is used to create
      // an association with that CompanyType (CompanyType).
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
        .then(resp => resp.data); // fix to get axios cooperate nicely with graphQL
      }
    }
  })
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/users/${args.id}`)
          .then(resp => resp.data); // fix to get axios cooperate nicely with graphQL
      }
    },
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/companies/${args.id}`)
          .then(resp => resp.data); // fix to get axios cooperate nicely with graphQL
      }
    }
  }
});

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUser: {
      type: UserType,
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        companyId: { type: GraphQLString }
      },
      // destructuring firstName and age from args
      resolve(parentValue, { firstName, age}) {
        return axios.post('http://localhost:3000/users', { firstName, age })
        .then(resp => resp.data);
      }
    },
    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      // destructuring id from args
      resolve(parentValue, { id }) {
        return axios.delete(`http://localhost:3000/users/${id}`)
          .then(res => res.data);
      }
    },
    editUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        companyId: { type: GraphQLString }
      },
      resolve(parentValue, args) {
        return axios.patch(`http://localhost:3000/users/${args.id}`, args)
          .then(res => res.data);
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation
});
