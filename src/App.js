import React, { Component } from "react";
import axios from "axios";
import "./App.css";

axios.interceptors.response.use(null, (error) => {
  const expectedError =
    error.reponse && error.reponse.status >= 400 && error.repose.status < 500;

  if (!expectedError) {
    //Unexpected (Network Down, server down, database down, bug)
    // - Log them
    // - Display a generic and friendly error message
    console.log(error);
    alert("An unexpected error occurred.");
  }
  return Promise.reject(error);
});

const apiEndpoint = "http://jsonplaceholder.typicode.com/posts";

class App extends Component {
  state = {
    posts: [],
  };

  async componentDidMount() {
    // pending > resolved (success) OR rejected (failure)
    //const promise = axios.get("http://jsonplaceholder.typicode.com/posts");
    //const response = await promise;
    const { data: posts } = await axios.get(apiEndpoint);
    this.setState({ posts });
  }

  handleAdd = async () => {
    const obj = { title: "a", body: "b" };
    const { data: post } = await axios.post(apiEndpoint, obj);

    const posts = [post, ...this.state.posts];
    this.setState({ posts });
  };

  handleUpdate = async (post) => {
    //Pessimistic Update
    post.title = "UPDATED";
    await axios.put(apiEndpoint + "/" + post.id, post);
    //axios.put(apiEndpoint + "/" + post.id, { title: post.title });

    const posts = [...this.state.posts];
    const index = posts.indexOf(post);
    posts[index] = { ...post };
    this.setState({ posts });
  };

  handleDelete = async (post) => {
    //Optimistic Update
    const orginalPosts = this.state.posts;

    const posts = this.state.posts.filter((p) => p.id !== post.id);
    this.setState({ posts });

    try {
      await axios.delete(apiEndpoint + "/" + post.id);
      //throw new Error("");
    } catch (error) {
      //Expected (404: not found, 400: bad request) - CLIENT ERRORS
      // - Display a specific error message
      if (error.response && error.reponse.status === 404)
        alert("This post has already been deleted.");

      this.setState({ posts: orginalPosts });
    }
  };

  render() {
    return (
      <React.Fragment>
        <button className="btn btn-primary" onClick={this.handleAdd}>
          Add
        </button>
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Update</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {this.state.posts.map((post) => (
              <tr key={post.id}>
                <td>{post.title}</td>
                <td>
                  <button
                    className="btn btn-info btn-sm"
                    onClick={() => this.handleUpdate(post)}
                  >
                    Update
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => this.handleDelete(post)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </React.Fragment>
    );
  }
}

export default App;
