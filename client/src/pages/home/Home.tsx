import { useAppSelector } from "src/redux/hooks";
import Page from "../../components/Page";
import "./home.css";
import moment from "moment";
import { Icon } from "@iconify/react";
import { Accordion } from "react-bootstrap";
import { useState } from "react";
import { get, orderBy } from "lodash";
import CreatePostComponent from "components/CreatePostComponent";

export default function Home() {
  const { posts, user, socket } = useAppSelector((state) => ({
    posts: state.posts.posts,
    socket: state.socket.socket,
    user: state.auth.user,
  }));
  const [comment, setComment] = useState("");
  return (
    <Page title="Home">
      <div className="container">
        <h1 className="my-4">All Public posts</h1>
        <CreatePostComponent />
        {orderBy(posts, 'timestamp','desc').map((post) => (
          <div key={post._id}>
            <div className="row">
              <div className="col-md-7">
                {post.type.includes("image") && (
                  <img src={post.content} alt="" style={{ width: "100%" }} />
                )}
                {post.type.includes("video") && (
                  <video src={post.content} style={{ width: "100%" }} />
                )}
                {post.type.includes("text") && <h3>{post.content}</h3>}
              </div>
              <div className="col-md-5">
                <h3>{post.owner.displayName}</h3>
                <p>
                  {moment(post.timestamp).format("MMMM Do YYYY, h:mm:ss a")}
                </p>
                <p>
                  <strong>{post.text}</strong>
                </p>
                <button
                  style={{ border: "none", padding: 8 }}
                  onClick={() => {
                    if (post.likes?.includes(`${user?._id}`)) {
                      socket?.emit("unlike-post", {
                        post_id: post._id,
                        user_id: user?._id,
                      });
                    } else {
                      socket?.emit("like-post", {
                        post_id: post._id,
                        user_id: user?._id,
                      });
                    }
                  }}
                >
                  {post.likes.includes(`${user?._id}`) ? (
                    <Icon
                      icon="mdi:like"
                      style={{ fontSize: 20, color: " #17A9FD" }}
                    />
                  ) : (
                    <Icon icon="ei:like" style={{ fontSize: 26 }} />
                  )}
                  {post.likes.length} Likes
                </button>
                <button
                  // onClick={() => setShowCommentDialog(true)}
                  style={{ border: "none", marginLeft: 8, padding: 8 }}
                >
                  <Icon
                    icon="teenyicons:chat-outline"
                    style={{ fontSize: 16, marginRight: 8 }}
                  />
                  {post.comments.length} Comments
                </button>
                <Accordion className="mt-2">
                  <Accordion.Item eventKey="0" style={{}}>
                    <Accordion.Header>Comments</Accordion.Header>
                    <Accordion.Body>
                      <div className="post-footer">
                        <div className="input-group mb-2">
                          <input
                            className="form-control"
                            placeholder="Add a comment"
                            type="text"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                          />
                          <button
                            className="b-none border-0"
                            style={{ borderRadius: "0px 4px 4px 0px" }}
                            onClick={() => {
                              socket?.emit("comment-post", {
                                post_id: post._id,
                                user_id: user?._id,
                                text: comment,
                              });
                              setComment("");
                            }}
                          >
                            Submit
                          </button>
                        </div>
                        <ul
                          className="comments-list"
                          style={{ listStyleType: "none" }}
                        >
                          {orderBy(post.comments, "timestamp", "desc").map(
                            (comment, index) => (
                              <li
                                className="comment border p-2 rounded mb-2"
                                key={index}
                              >
                                <div className="d-flex border-bottom mb-2">
                                  <img
                                    className="avatar"
                                    src={get(comment, "user.photoURL")}
                                    alt="avatar"
                                    style={{
                                      width: 40,
                                      height: 40,
                                      borderRadius: 20,
                                    }}
                                  />
                                  <div
                                    className="comment-heading"
                                    style={{ marginLeft: 8 }}
                                  >
                                    <p className="p-0 m-0">
                                      {get(comment, "user.displayName")}
                                    </p>
                                    <p
                                      className="time"
                                      style={{ fontSize: 12 }}
                                    >
                                      {moment(
                                        get(comment, "timestamp")
                                      ).fromNow()}
                                    </p>
                                  </div>
                                </div>
                                <div className="comment-body">
                                  <p>{comment.text}</p>
                                </div>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </div>
            </div>

            <hr />
          </div>
        ))}
      </div>
    </Page>
  );
}
