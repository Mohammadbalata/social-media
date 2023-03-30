const baseUrl = "https://tarmeezacademy.com/api/v1";
const urlpageParams = new URLSearchParams(window.location.search);
const pagePostIdParam = urlpageParams.get("postId");
const pageUserIdParam = urlpageParams.get("userId"); 
//=============== SETUPUI FUNCTIONS ============
function showUserProfileImg(name, image) {
  let user =JSON.parse(localStorage.getItem("user")) 
  let userId = user.id
  document.getElementById("user-logo-div").innerHTML = `
  <span onclick="userNameClicked(${userId})" style="cursor: pointer;">
      <img class="rounded-circle border border-3" src="${image}" alt="" style="width: 40px;height: 40px;">
          <b class="p-2">@${name}</b>
          </span>
      `;
}
function setupUI() {
  const token = localStorage.getItem("token");
  let user = JSON.parse(localStorage.getItem("user"));
  const logoutDiv = document.getElementById("logout-div");
  const loginRegisterDiv = document.getElementById("log-reg-div");
  const addBtn = document.getElementById("add-btn");
  const addCommentDiv = document.getElementById("add-comment-div");

  if (token == null) {
    if (addCommentDiv != null) {
      addCommentDiv.style.setProperty("display", "none", "important");
    }
    if (addBtn != null) {
      addBtn.style.setProperty("display", "none", "important");
    }
    logoutDiv.style.setProperty("display", "none", "important");
    loginRegisterDiv.style.setProperty("display", "flex", "important");
  } else {
    loginRegisterDiv.style.setProperty("display", "none", "important");
    logoutDiv.style.setProperty("display", "flex", "important");
    if (addBtn != null) {
      addBtn.style.setProperty("display", "block", "important");
    }
    if (addCommentDiv != null) {
      addCommentDiv.style.setProperty("display", "flex", "important");
    }
    showUserProfileImg(user.username, user.profile_image);
  }
  // if this statment was true then its the all post page
  if (pagePostIdParam == null && pageUserIdParam == null) {
    getPosts();
  }
  if(pageUserIdParam != null){
    getProfilePosts(pageUserIdParam)
  }
}

function getPosts(reload = true, page = 1) {
  toggelLoader(true)
  axios.get(`${baseUrl}/posts?limit=5&page=${page}`).then((response) => {
    toggelLoader(false)
    let posts = response.data.data;
    lastPage = response.data.meta.last_page;
    if (reload) {
      document.getElementById("posts").innerHTML = "";
    }
    let user = JSON.parse(localStorage.getItem("user"));
    let isShow = false;
    let userId = 0;
    if (user != null) {
      userId = user.id;
      isShow = true;
    }
    for (post of posts) {
      let postTitle = "";
      if (post.title != null) {
        postTitle = post.title;
      }

      let tags = post.tags;
      let spanTag = "";
      for (tag of tags) {
        spanTag += `
                      <button class="btn btn-sm rounded-5" style="color: white;background-color:gray;">
                        ${tag.name}
                      </button>
                  `;
      }

      let content = `
                  <div class="card shadow my-3">
                          <div class="card-header">
                          <span onclick="userNameClicked(${post.author.id})" style="cursor: pointer;">
                              <img class="rounded-circle border border-3" src="${
                                post.author.profile_image
                              }" alt="" style="width: 40px;height: 40px;">
                              <b>@${post.author.username}</b>
                              </span>
                              ${
                                isShow && post.author.id == userId
                                  ? `​<button class='btn btn-danger' style='margin-left:10px;float: right' onclick="deleteBtnClicked('${encodeURIComponent(
                                      JSON.stringify(post)
                                    )}')">Delete</button>                                  
                                  ​<button class='btn btn-secondary' style='float: right' onclick="editPostBtnClicked('${encodeURIComponent(
                                    JSON.stringify(post)
                                  )}')">Edit</button>`
                                  : ""
                              }
                              
                          </div>
                          <div class="card-body" onclick="postClicked(${
                            post.id
                          })" style="cursor: pointer;">
                              <img class="w-100 h-100" src="${
                                post.image
                              }" alt="">
                              <h6 class="mt-1" style="color: gray;">
                                  ${post.created_at}
                              </h6>
                              <h5>
                                  ${postTitle}
                              </h5>
                              <p>
                                  ${post.body}
                              </p>
                              <hr>
                              
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16">
                                      <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001zm-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708l-1.585-1.585z"/>
                              </svg>
                              
                              <span>
                                  (${post.comments_count}) Comments
                              </span>
                              <span>
                                  ${spanTag}
                              </span>
                          </div>
                      </div>
                  `;
      document.getElementById("posts").innerHTML += content;
    }
  });
}

function postClicked(postId){
  window.location = `postDetails.html?postId=${postId}`;
}



// =============== AUTH FUNCTIONS ===============

function loginBtnClicked() {
  const username = document.getElementById("username-input").value;
  const password = document.getElementById("password-input").value;
  const params = {
    username: username,
    password: password,
  };
  const url = `${baseUrl}/login`;
  axios
    .post(url, params)
    .then((response) => {
      let token = response.data.token;
      let user = response.data.user;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      // to close the modal afetr login
      const modal = document.getElementById("loginModal");
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance.hide();
      //.......................

      showAlert("You have been login successfully", "success");
      setupUI();
    })
    .catch((error) => {
      const errorMessag = error.response.data.message;
      showAlert(errorMessag, "danger");
    });
}

function registerBtnClicked() {
  const url = `${baseUrl}/register`;
  const name = document.getElementById("register-name-input").value;
  const password = document.getElementById("register-password-input").value;
  const username = document.getElementById("register-username-input").value;
  const userImg = document.getElementById("register-img-input").files[0];
  let formData = new FormData();
  formData.append("name", name);
  formData.append("username", username);
  formData.append("password", password);
  formData.append("image", userImg);

  const headers = {
    "Content-Type": "multipart/form-data",
  };
  axios
    .post(url, formData, {
      headers: headers,
    })
    .then((response) => {
      let token = response.data.token;
      let user = response.data.user;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      // to close the modal afetr login
      const modal = document.getElementById("registerModal");
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance.hide();
      //.......................

      showAlert("You have been registered successfully", "success");
      setupUI();
    })
    .catch((error) => {
      const errorMessag = error.response.data.message;
      showAlert(errorMessag, "danger");
    });
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  setupUI();
  showAlert("You have loged out ", "danger");
  window.location = `index.html`;

}

// EDIT POST FUNCTION
function editPostBtnClicked(postObject) {
  let post = JSON.parse(decodeURIComponent(postObject));

  document.getElementById("edit-post-title").innerHTML = "Edit Post";
  document.getElementById("post-modal-submit-btn").innerHTML = "Edit";
  // to reuse the post modal
  let postModal = new bootstrap.Modal(
    document.getElementById("create-post-modal")
  );
  //......
  document.getElementById("post-id-input").value = post.id;
  document.getElementById("post-title-input").value = post.title;
  document.getElementById("post-body-input").value = post.body;

  //to close/open the modal
  postModal.toggle();
  //.........
}

//to show the modal
function deleteBtnClicked(postObject) {
  let post = JSON.parse(decodeURIComponent(postObject));
  document.getElementById("delete-post-id-input").value = post.id;
  // to reuse the post modal
  let postModal = new bootstrap.Modal(
    document.getElementById("delete-post-modal")
  );
  //......
  //to close/open the modal
  postModal.toggle();
  //.........
}

//to delete the post
function confirmDeletePost() {
  const token = localStorage.getItem("token");
  let postId = document.getElementById("delete-post-id-input").value;
  const headers = {
    "Content-Type": "multipart/form-data",
    authorization: `Bearer ${token}`,
  };
  axios
    .delete(`${baseUrl}/posts/${postId}`, {
      headers: headers,
    })
    .then((response) => {
      // to close the modal afetr login
      const modal = document.getElementById("delete-post-modal");
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance.hide();
      //.......................
      showAlert("The Post Deleted", "success");
      setupUI();
    })
    .catch((error) => {
      const errorMessag = error.response.data.message;
      showAlert(errorMessag, "danger");
    });
}

function addBtnClicked() {
  //this function redesign the creat-post-modal to add post
  document.getElementById("edit-post-title").innerHTML = "Create A New Post";
  document.getElementById("post-modal-submit-btn").innerHTML = "Creat";
  // to reuse the post modal
  let postModal = new bootstrap.Modal(
    document.getElementById("create-post-modal")
  );
  //......
  document.getElementById("post-id-input").value = "";
  document.getElementById("post-title-input").value = "";
  document.getElementById("post-body-input").value = "";

  //to close/open the modal
  postModal.toggle();
}

//============ ALERT FUNCTION============
function showAlert(recivedMessage, alertType) {
  const alertPlaceholder = document.getElementById("alert-div");

  const alert = (message, type) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = [
      `<div id="hideMeAfter5Seconds" class="show fade border border-${type} border border-4 alert alert-${type} alert-dismissible" role="alert">`,
      `   <div>${message}</div>`,
      "</div>",
    ].join("");

    alertPlaceholder.append(wrapper);
  };
  alert(recivedMessage, alertType);
}


function getProfilePosts(userIdToShow){
  axios.get(`https://tarmeezacademy.com/api/v1/posts`)
  .then((response) => {
    let posts = response.data.data;
    let user = JSON.parse(localStorage.getItem("user"));
let isShow = false;
let userId = 0;
if (user != null) {
  userId = user.id;
  isShow = true;
}
document.getElementById("profile-posts").innerHTM = ""
for (post of posts) {
  if(post.author.id == userIdToShow){

    let postTitle = "";
    if (post.title != null) {
      postTitle = post.title;
    }

    let tags = post.tags;
    let spanTag = "";
    for (tag of tags) {
      spanTag += `
                    <button class="btn btn-sm rounded-5" style="color: white;background-color:gray;">
                      ${tag.name}
                    </button>
                `;
    }

    let content = `
                <div class="card shadow my-3">
                        <div class="card-header">
                        <span onclick="userNameClicked(${post.author.id})" style="cursor: pointer;">
                            <img class="rounded-circle border border-3" src="${
                              post.author.profile_image
                            }" alt="" style="width: 40px;height: 40px;">
                            <b>@${post.author.username}</b>
                            </span>
                            ${
                              isShow && post.author.id == userId
                                ? `​<button class='btn btn-danger' style='margin-left:10px;float: right' onclick="deleteBtnClicked('${encodeURIComponent(
                                    JSON.stringify(post)
                                  )}')">Delete</button>                                  
                                ​<button class='btn btn-secondary' style='float: right' onclick="editPostBtnClicked('${encodeURIComponent(
                                  JSON.stringify(post)
                                )}')">Edit</button>`
                                : ""
                            }
                            
                            
                        </div>
                        <div class="card-body" onclick="postClicked(${
                          post.id
                        })" style="cursor: pointer;">
                            <img class="w-100 h-100" src="${
                              post.image
                            }" alt="">
                            <h6 class="mt-1" style="color: gray;">
                                ${post.created_at}
                            </h6>
                            <h5>
                                ${postTitle}
                            </h5>
                            <p>
                                ${post.body}
                            </p>
                            <hr>
                            
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16">
                                    <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001zm-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708l-1.585-1.585z"/>
                            </svg>
                            
                            <span>
                                (${post.comments_count}) Comments
                            </span>
                            <span>
                                ${spanTag}
                            </span>
                        </div>
                    </div>
                `;
    document.getElementById("profile-posts").innerHTML += content;
  }
}
  })
}

function toggelLoader(isShow = true){
  if(isShow){
    document.getElementById("loader").style.visibility = "visible"
  }else{
    document.getElementById("loader").style.visibility = "hidden"
  }
 }
