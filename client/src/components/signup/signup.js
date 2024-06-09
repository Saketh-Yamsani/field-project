import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./signup.css";
import 'bootstrap/dist/css/bootstrap.css';
function Signup() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [err, setErr] = useState("");
    const [signupSuccess, setSignupSuccess] = useState(false);
    const navigate = useNavigate();

    async function onSignUpFormSubmit(userObj) {
        const endpoint = "http://localhost:5000/faculty-api/users"; // Unified endpoint
        try {
            let res = await axios.post(endpoint, userObj);
            if (res.status === 201) {
                setSignupSuccess(true);
                setErr("");
                navigate("/signin");
            } else {
                setErr(res.data.message);
            }
        } catch (error) {
            setErr("Registration failed. Only one user is allowed to register.");
        }
    }

    return (
        <div className="container">
            <div className="row justify-content-center mt-5">
                <div className="col-lg-4 col-md-6 col-sm-6">
                    <div className="card shadow">
                        <div className="card-title text-center border-bottom">
                            {signupSuccess ? (
                                <div>
                                    <p className="lead fs-3 text-center display-4 text-success">
                                        User registration success
                                    </p>
                                    <p className="text-center fs-6 text-secondary">
                                        Proceed to <Link to="/signin">Login</Link>
                                    </p>
                                    <p className="text-center fs-6 text-secondary">
                                        Back to <Link to="/">Home</Link>
                                    </p>
                                </div>
                            ) : (
                                <h2 className="form-label">Signup</h2>
                            )}
                        </div>
                        <div className="card-body">
                            {err && (
                                <p className="lead text-center text-danger">{err}</p>
                            )}
                            <form onSubmit={handleSubmit(onSignUpFormSubmit)}>
                                <div className="mb-4">
                                    <label htmlFor="username" className="form-label">Username</label>
                                    <input type="text" className="form-control" id="username" {...register("username", { required: true })} />
                                    {errors.username && <p className="text-danger">Username is required</p>}
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="password" className="form-label">Password</label>
                                    <input type="password" className="form-control" id="password" {...register("password", { required: true })} />
                                    {errors.password && <p className="text-danger">Password is required</p>}
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="email" className="form-label">Email</label>
                                    <input type="email" className="form-control" id="email" {...register("email", { required: true })} />
                                    {errors.email && <p className="text-danger">Email is required</p>}
                                </div>
                                <div className="text-end">
                                    <button type="submit" className="btn">Register</button>
                                </div>
                            </form>
                            <div className="text-center mt-3">
                                <p>Already registered? <Link to="/signin">Sign in here</Link></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signup;
