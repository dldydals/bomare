import './Footer.css';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container footer-content">
                <div className="footer-brand">
                    <h2 className="footer-logo">Bomare Wedding</h2>
                    <p className="footer-slogan">"당신의 사랑이 작품이 되는 순간<br></br>The Moment Your Love Becomes a Work of Art."</p>
                    <div className="contact-info">
                        <p>서울시 강남구 청담동 123-45</p>
                        <p>Tel: 02-1234-5678</p>
                        <p>Email: contact@bomare.com</p>
                    </div>
                </div>

                <div className="footer-links">
                    <div className="link-group">
                        <h3>Menu</h3>
                        <a href="/about">About</a>
                        <a href="/portfolio">Portfolio</a>
                        <a href="/event">Event</a>
                    </div>
                    <div className="link-group">
                        <h3>Social</h3>
                        <a href="#">Instagram</a>
                        <a href="#">Facebook</a>
                        <a href="#">Youtube</a>
                    </div>
                </div>
            </div>
            <div className="footer-bottom container">
                <p>&copy; {new Date().getFullYear()} Bomare Wedding. All rights reserved.</p>
            </div>
        </footer>
    );
}
