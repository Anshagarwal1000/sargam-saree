const address = "Sargam Sarees, Shree Bhawan, Above Burlington Tailors, Hill Cart Road, Siliguri";
const mapUrl = "https://www.google.com/maps/search/?api=1&query=Sargam+Sarees+Shree+Bhawan+Above+Burlington+Tailors+Hill+Cart+Road+Siliguri";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand">
          <img className="footer-logo" src="/shop_logo.jpeg" alt="Sargam Sarees" />
        </div>

        <div className="footer-contact">
          <div className="footer-detail">
            <span className="footer-label">Shop address</span>
            <address>{address}</address>
          </div>

          <div className="footer-detail">
            <span className="footer-label">Call us</span>
            <div className="footer-phone-list">
              <a href="tel:8918367311">8918367311</a>
              <a href="tel:6295576969">6295576969</a>
            </div>
          </div>

          <a
            className="map-link"
            href={mapUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open in Google Maps <span aria-hidden="true">-&gt;</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
