const http = new MockAPI();

document.querySelector("#user-info").addEventListener("click", getUser);
document.querySelector("#add-user").addEventListener("click", () => {
  document.querySelector("#addUserForm").classList.toggle("hidden");
});
const showAlert = document.querySelector(".show-alert");
document.querySelector("#addUserForm").addEventListener("submit", addUser);

const output = document.querySelector(".output");

let isEditing = false;
let editingUserId = null;

function getUser() {
  http
    .get("https://67a788ff203008941f67de65.mockapi.io/users/Users")
    .then((data) => {
      output.innerHTML = ` 
        <table class="table table-hover table-striped">
          <caption>
            User Information is shown in the table
          </caption>
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Country</th>
              <th>State</th>
              <th>Edit / Delete</th>
            </tr>
          </thead>
          <tbody>
            ${data
              .map(
                (user) => ` 
                <tr id="${user.id}">
                    <td>${user.name}</td>
                    <td>${user.company}</td>
                    <td>${user.country}</td>
                    <td>${user.state}</td>
                    <td class="d-flex gap-3">
                        <span class="btn btn-warning edit">E</span>
                        <span class="btn btn-danger delete">D</span>
                    </td>
                </tr>`
              )
              .join("")}
          </tbody>
        </table>`;

      document.querySelector("#user-info").classList.add("disabled");
      document.querySelector("#add-user").classList.remove("disabled");

      document.querySelector("tbody").addEventListener("click", deleteUser);
      document.querySelector("tbody").addEventListener("click", editUser);
    })
    .catch((err) => console.log(err));
}

function addUser(e) {
  e.preventDefault();

  const name = document.querySelector("#name").value;
  const company = document.querySelector("#company").value;
  const country = document.querySelector("#country").value;
  const state = document.querySelector("#state").value;

  if (!name || !company || !country || !state) {
    alert("Please fill all the fields");
    return;
  }

  const user = { name, company, country, state };

  if (isEditing && editingUserId) {
    // If in edit mode, update user
    http
      .put(
        `https://67a788ff203008941f67de65.mockapi.io/users/Users/${editingUserId}`,
        user
      )
      .then(() => {
        showAlert.innerHTML = `
        <div class="alert alert-success" role="alert">
          User updated successfully.
        </div>`;

        setTimeout(() => (showAlert.innerHTML = ""), 4000);

        resetForm();
        getUser(); // Refresh list
      })
      .catch((err) => console.error("Error updating user:", err));
  } else {
    // If not in edit mode, create a new user
    http
      .post("https://67a788ff203008941f67de65.mockapi.io/users/Users", user)
      .then((data) => {
        showAlert.innerHTML = `
        <div class="alert alert-success" role="alert">
          New user has been added:
            <p>Name - ${data.name}</p>
            <p>Company - ${data.company}</p>
            <p>Country - ${data.country}</p>
            <p>State - ${data.state}</p>
        </div>`;

        setTimeout(() => (showAlert.innerHTML = ""), 4000);

        resetForm();
        getUser();
      })
      .catch((err) => console.error("Error adding user:", err));
  }
}

function editUser(e) {
  if (!e.target.classList.contains("edit")) return;

  const userRow = e.target.parentElement.parentElement;
  editingUserId = userRow.id;
  isEditing = true;

  document.querySelector("#addUserForm").classList.remove("hidden");
  document.querySelector("#name").value = userRow.children[0].innerText;
  document.querySelector("#company").value = userRow.children[1].innerText;
  document.querySelector("#country").value = userRow.children[2].innerText;
  document.querySelector("#state").value = userRow.children[3].innerText;

  document.querySelector(".add-user-inner").innerText = "Update User";
}

function deleteUser(e) {
  if (!e.target.classList.contains("delete")) return;

  const userRow = e.target.parentElement.parentElement;
  const userId = userRow.id;

  http
    .delete(`https://67a788ff203008941f67de65.mockapi.io/users/Users/${userId}`)
    .then(() => {
      userRow.remove();
      showAlert.innerHTML = `
      <div class="alert alert-danger" role="alert">
        User deleted successfully.
      </div>`;
      setTimeout(() => (showAlert.innerHTML = ""), 4000);
    })
    .catch((err) => console.error("Error deleting user:", err));
}

function resetForm() {
  document.querySelector("#userForm").reset();
  document.querySelector("#addUserForm").classList.add("hidden");
  document.querySelector(".add-user-inner").innerText = "Add User";
  isEditing = false;
  editingUserId = null;
}
