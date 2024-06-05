/* eslint-disable @typescript-eslint/no-explicit-any */
import Page from "components/Page";
import "./profile.css";
import { useEffect, useRef } from "react";
import { setSnack } from "src/redux/reducers/snack.reducer";
import { setProfile } from "src/redux/reducers/profile.reducer";
import { setUser } from "src/redux/reducers/auth.reducer";
import axios from "axios";
import { Controller, useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "src/redux/hooks";
import { useParams } from "react-router-dom";
import { Button } from "react-bootstrap";
export default function Profile() {
  const params = useParams();
  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const { socket, user, profileData } = useAppSelector((state) => ({
    socket: state.socket.socket,
    user: state.auth.user,
    profileData: state.profile.data,
  }));

  const { control, getValues, setValue } = useForm({
    defaultValues: {
      displayName: "",
      email: "",
      phoneNumber: "",
      dob: new Date(),
      address: "",
    },
  });

  async function saveProfile() {
    const values = getValues();
    const obj = { ...values, _id: profileData?._id };
    socket?.emit("update-profile", obj);
    dispatch(setProfile(obj));
    dispatch(
      setSnack({ open: true, message: "Profile updated", type: "success" })
    );
  }

  async function handleFileUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) {
    try {
      if (e.target.files) {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);
        const { data } = await axios.post(
          `${import.meta.env.VITE_express_server}/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        const obj = {
          ...profileData,
          [type]: data.fileUrl,
        };
        socket?.emit("update-profile", obj);
        dispatch(setProfile(obj));
        dispatch(
          setUser({
            ...user,
            [type]: data.fileUrl,
          })
        );
        dispatch(
          setSnack({ open: true, message: "Profile updated", type: "success" })
        );
      }
    } catch (error: any) {
      dispatch(setSnack({ open: true, message: error.message, type: "error" }));
    }
  }
  useEffect(() => {
    if (socket && user?._id && !profileData) {
      const tempId = params.id || user?._id;
      socket.emit("get-profile-request", tempId);
    }
    if (profileData) {
      setValue("displayName", profileData.displayName);
      setValue("email", profileData.email);
      setValue("phoneNumber", profileData.phoneNumber);
      setValue("dob", new Date(profileData.dob));
      setValue("address", profileData.address);
    }
  }, [
    params.id,
    socket,
    user?._id,
    dispatch,
    user?.email,
    profileData,
    setValue,
  ]);
  return (
    <Page title="Profile">
      <input
        ref={coverInputRef}
        type="file"
        hidden
        accept="image/*"
        onChange={(e) => handleFileUpload(e, "cover")}
      />
      <input
        ref={profileInputRef}
        type="file"
        hidden
        accept="image/*"
        onChange={(e) => handleFileUpload(e, "photoURL")}
      />
      <div className="container emp-profile">
        <form method="post">
          <div className="row">
            <div className="col-md-4">
              <div className="profile-img relative">
                <img
                  src={user?.photoURL}
                  style={{
                    // position: "absolute",
                    width: 200,
                    height: 200,
                    objectFit: "cover",
                  }}
                  alt=""
                />
                <div>
                  <Button
                    onClick={() => profileInputRef.current?.click()}
                    className="mt-4"
                  >
                    Update Profile Pic
                  </Button>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="profile-head">
                <h5>{user?.displayName}</h5>
                <h6>{user?.email}</h6>
              </div>
            </div>
            <div className="col-md-2">
              <button
                onClick={saveProfile}
                type="button"
                id="submit"
                name="submit"
                className="btn btn-primary"
              >
                Update
              </button>
            </div>
          </div>
          <div className="row">
            <div className="col-md-4"></div>
            <div className="col-md-8">
              <div className="tab-content profile-tab" id="myTabContent">
                <div
                  className="tab-pane fade show active"
                  id="home"
                  role="tabpanel"
                  aria-labelledby="home-tab"
                >
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <label>Name</label>
                    </div>
                    <div className="col-md-6">
                      <Controller
                        name="displayName"
                        control={control}
                        render={({ field }) => (
                          <input
                            type="text"
                            className="form-control"
                            id="displayName"
                            placeholder="Enter name"
                            {...field}
                          />
                        )}
                      />
                    </div>
                  </div>
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <label>Email</label>
                    </div>
                    <div className="col-md-6">
                      <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                          <input
                            type="text"
                            disabled
                            className="form-control"
                            id="email"
                            placeholder="Enter email"
                            {...field}
                          />
                        )}
                      />
                    </div>
                  </div>
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <label>DOB</label>
                    </div>
                    <div className="col-md-6">
                      <Controller
                        name="dob"
                        control={control}
                        render={({ field }) => (
                          <input
                            type="date"
                            className="form-control"
                            id="dob"
                            {...field}
                          />
                        )}
                      />
                    </div>
                  </div>
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <label>Phone</label>
                    </div>
                    <div className="col-md-6">
                      <Controller
                        name="phoneNumber"
                        control={control}
                        render={({ field }) => (
                          <input
                            type="phone"
                            className="form-control"
                            id="phoneNumber"
                            placeholder="Enter phone"
                            {...field}
                          />
                        )}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <label>Address</label>
                    </div>
                    <div className="col-md-6">
                      <Controller
                        name="address"
                        control={control}
                        render={({ field }) => (
                          <input
                            type="text"
                            className="form-control"
                            id="address"
                            placeholder="Enter Address"
                            {...field}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
                <div
                  className="tab-pane fade"
                  id="profile"
                  role="tabpanel"
                  aria-labelledby="profile-tab"
                >
                  <div className="row">
                    <div className="col-md-6">
                      <label>Experience</label>
                    </div>
                    <div className="col-md-6">
                      <p>Expert</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <label>Hourly Rate</label>
                    </div>
                    <div className="col-md-6">
                      <p>10$/hr</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <label>Total Projects</label>
                    </div>
                    <div className="col-md-6">
                      <p>230</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <label>English Level</label>
                    </div>
                    <div className="col-md-6">
                      <p>Expert</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <label>Availability</label>
                    </div>
                    <div className="col-md-6">
                      <p>6 months</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <label>Your Bio</label>
                      <br />
                      <p>Your detail description</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Page>
  );
}
