
document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('signup-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission behavior
    signup();
  });
});



async function signup() {
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await axios.post('http://localhost:3000/signup', {
      name: name,
      email: email,
      password: password
    });

    // Handle success (display a message or redirect)
    alert(response.data.message);
    window.location.href = "/frontend.html";  // Redirect to another page on success

  } catch (error) {
    if (error.response) {
      // Handle specific error from server
      alert(error.response.data.message);
    } else {
      // Handle generic error
      alert('Something went wrong! Please try again.');
    }
    console.error('Error:', error);
  }
}