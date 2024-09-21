

const signin = async (event) => {
    event.preventDefault(); // Prevent default form submission

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await axios.post('http://localhost:3000/signin', {
            email: email,
            password: password
        });
        console.log('Sign-in successful:', response.data);
        
        // Save token and redirect
        localStorage.setItem('token', response.data.token);
        window.location.href = '/frontend.html'; // Replace with your actual frontend page
       
    } catch (error) {
        console.error('Error during sign-in:', error.response?.data?.message || 'Unknown error');
        alert(error.response?.data?.message || 'Sign-in failed');
    }
};

console.log("signup end");







document.getElementById('signin-form').addEventListener('submit', signin);


