
document.addEventListener("DOMContentLoaded",()=>{
    document.getElementById('signin-form').addEventListener('DOMContentLoaded', function(event) {
        event.preventDefault(); // Prevent the default form submission behavior
        signin();
      });
});




  async function signin() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await axios.post('http://localhost:3000/signin', {
            email: email,
            password: password
        });
        if(response.data.token){
            const token  = response.data.token;
            localStorage.setItem('authToken',token);
            alert(response.data.message);
            window.location.href ="/frontend.html";
            
        }else{
            alert(response.data.message);
        }
        
        // document.getElementById('username-dispaly').innerHTML = `Welcome,${email}`;  
        
    } catch (error) {
        if (error.response) {
            alert(error.response.data.message);
        } else {
            alert("Network Error");
        }
        console.error('Error:', error);
    }
}





