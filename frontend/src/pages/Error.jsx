import './Error.css';
import { useNavigate } from 'react-router-dom';

const Error = ({ errorCode, errorMessage}) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    if(errorCode==401 || errorCode==403){
      localStorage.removeItem("session");
      localStorage.removeItem("user");
    }
    navigate('/');
  };

  return (
    <div className="error-container">
      <div className="error-box">
        <h1 className="error-code">{errorCode ? errorCode : 404}</h1>
        <p className="error-message">{errorMessage ? errorMessage : "Page Not Found"}</p>
        <button className="home-button" onClick={handleGoHome}>
          Go Back to Home
        </button>
      </div>
    </div>
  );
};

export default Error;
