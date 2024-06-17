import React, { useEffect } from "react";
import "./signin.css";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { userLoginThunk } from "../../redux/slices/userSlice"; // Assuming the redux slice is updated
import { useNavigate, Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.css';
function Signin() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { isPending, currentUser, loginUserStatus, errorOccurred, errMsg } = useSelector((state) => state.userLogin);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    function onSignInFormSubmit(userCred) {
        dispatch(userLoginThunk(userCred));
    }

    useEffect(() => {
        if (loginUserStatus && currentUser) {
            navigate("/home");
        }
    }, [loginUserStatus, navigate, currentUser]);

    return (
        <div className="container">
            <div className="row justify-content-center mt-5">
                <div className="col-lg-4 col-md-6 col-sm-6">
                    <div className="card shadow">
                        <div className="card-title text-center border-bottom">
                            <h2 className="form-label">Signin</h2>
                        </div>
                        <div className="card-body">
                            {errorOccurred && (
                                <p className="text-center" style={{ color: "var(--crimson)" }}>
                                    {errMsg}
                                </p>
                            )}
                            <form onSubmit={handleSubmit(onSignInFormSubmit)}>
                                <div className="mb-4">
                                    <label htmlFor="username" className="form-label">Username</label>
                                    <input type="text" className="form-control" id="username" {...register("username")} />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="password" className="form-label">Password</label>
                                    <input type="password" className="form-control" id="password" {...register("password")} />
                                </div>
                                <div className="text-end">
                                    <button type="submit" className="btn">Login</button>
                                </div>
                            </form>
                            <div className="text-center mt-3">
                                <p>Not yet registered? <Link to="/signup">Register now</Link></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signin;
