const USER = {
    email: "test@example.com",
    password: "12345"
};

exports.loginUser = (req, res) => {
    const { email, password } = req.body;

    if (email === USER.email && password === USER.password) {
        return res.json({ message: "Login Successful" });
    }

    return res.status(401).json({ message: "Invalid Credentials" });
};
