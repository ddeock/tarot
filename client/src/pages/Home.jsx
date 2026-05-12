import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home-container">
      <h1>Shopimg Mall</h1>
      <div className="button-group">
        <Link to="/register" className="btn btn-primary">
          회원가입
        </Link>
      </div>
    </div>
  );
}

export default Home;
