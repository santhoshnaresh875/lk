import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function User() {
  const [users, setUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    gender: '',
    city: '',
    state: '',
    zip: '',
  });
  const [file, setFile] = useState(null);
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  const getUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const openPDF = async (filename) => {
    try {
      const response = await axios.get(`http://localhost:8000/files/${filename}`, {
        responseType: 'blob',
      });
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, '_blank');
    } catch (error) {
      console.error('Error opening PDF:', error);
    }
  };

  const downloadPDF = async (filename) => {
    try {
      const response = await axios.get(`http://localhost:8000/files/${filename}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const deleteData = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/deleteData/${id}`);
      getUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleEditClick = (user) => {
    setIsEditing(true);
    setCurrentUser(user);
    setFormData({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      gender: user.gender,
      city: user.city,
      state: user.state,
      zip: user.zip,
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('firstname', formData.firstname);
    data.append('lastname', formData.lastname);
    data.append('email', formData.email);
    data.append('gender', formData.gender);
    data.append('city', formData.city);
    data.append('state', formData.state);
    data.append('zip', formData.zip);
    if (file) data.append('file', file);
    if (image) data.append('image', image);

    try {
      await axios.put(`http://localhost:8000/updateUser/${currentUser._id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setIsEditing(false);
      setCurrentUser(null);
      setFormData({
        firstname: '',
        lastname: '',
        email: '',
        gender: '',
        city: '',
        state: '',
        zip: '',
      });
      setFile(null);
      setImage(null);
      getUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <div className="d-flex vh-80 bg-white justify-content-center align-items-center">
      <div className="w-50 bg-white rounded p-5">
        {users.map((user, index) => (
          <div key={index} className="card mb-3 shadow-lg">
            <div className="card-body">
              <h3 className="card-title">
                Welcome : {user.firstname} {user.lastname}
              </h3>
              <p className="card-text">Email: {user.email}</p>
              <p className="card-text">Gender: {user.gender}</p>
              <p className="card-text">City: {user.city}</p>
              <p className="card-text">State: {user.state}</p>
              <p className="card-text">Zip: {user.zip}</p>
              <p className='fil4'>
                File:
                {user.file && (
                  <button className="btn btn-primary" onClick={() => openPDF(user.file)}>
                    Open PDF
                  </button>
                )}
              </p>
              <p className='img2'>
                Image:
                {user.image && (
                  <img
                  className='imgmove3'
                    src={`http://localhost:8000/images/${user.image}`}
                    alt={user.image}
                    style={{ width: '250px', height: '250px' }}
                  />
                )}
              </p>
              <button className="btn btn-danger" onClick={() => deleteData(user._id)}>
                Delete
              </button>
              <button className="btn btn-secondary edit-button" onClick={() => handleEditClick(user)}>
                Edit
              </button>
              <button className="btn btn-success download-button2"  onClick={() => downloadPDF(user.file)}>
                Download PDF
              </button>
            </div>
          </div>
        ))}

        {isEditing && (
          <div className="card mb-3 shadow-lg">
            <div className="card-body">
              <h3 className="card-title">Edit User</h3>
              <form onSubmit={handleUpdateUser}>
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstname"
                    className="form-control"
                    value={formData.firstname}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastname"
                    className="form-control"
                    value={formData.lastname}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <input
                    type="text"
                    name="gender"
                    className="form-control"
                    value={formData.gender}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    className="form-control"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    className="form-control"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Zip</label>
                  <input
                    type="text"
                    name="zip"
                    className="form-control"
                    value={formData.zip}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>File</label>
                  <input
                    type="file"
                    name="file"
                    className="form-control"
                    onChange={handleFileChange}
                  />
                </div>
                <div className="form-group">
                  <label>Image</label>
                  <input
                    type="file"
                    name="image"
                    className="form-control"
                    onChange={handleImageChange}
                  />
                </div>
                <button type="submit" className="btn btn-primary btnsave2">
                  Save
                </button>
                <button type="button" className="btn btn-secondary btnsave3" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default User;
