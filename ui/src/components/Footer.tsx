import flexionLogo from 'url:../assets/Flexion_logo.svg';
import vanguardFedCiv from 'url:../assets/vanguard-FedCiv.png';
import digitalservicescoalition from 'url:../assets/digitalservicescoalition.png';

export default function Footer() {
  return (
    <footer className="footer-el" role="contentinfo">
      <div className="footer-content">
        <div className="footer-brand">
          <img className="footer-logo" src={flexionLogo} alt="Flexion logo" />
          <p className="footer-tagline">
            Using an agile, human-centered design mindset, we transform digital
            technology to create powerful experiences for all.
          </p>
        </div>

        <div className="footer-grid">
          <div
            className="footer-col contact"
            aria-label="Company contact information"
          >
            <p>
              Flexion Inc.
              <br />
              811 E Washington Ave
              <br />
              Suite 400
              <br />
              Madison, WI 53703
              <br />
              Phone: <a href="tel:6088348600">608.834.8600</a>
              <br />
              <a href="mailto:flexion@flexion.us">flexion@flexion.us</a>
              <br />
              <a
                href="https://namedrop.io/FlexionInc"
                className="usa-identifier__required-link"
              >
                Hear “Flexion” pronounced
              </a>
            </p>
          </div>

          <div className="footer-col nav">
            <ul>
              <li>
                <a href="#">Services</a>
              </li>
              <li>
                <a href="#">How We Work</a>
              </li>
              <li>
                <a href="#">Who We Serve</a>
              </li>
              <li>
                <a href="#">Careers</a>
              </li>
              <li>
                <a href="#">Contact Us</a>
              </li>
              <li>
                <a href="#">Blog</a>
              </li>
            </ul>
          </div>

          <div className="footer-col badge">
            <img
              src={vanguardFedCiv}
              alt="Vanguard FedCiv 250 Badge"
              className="footer-badge"
            />
            <p>
              Honored to be on the Prestigious
              <br />
              Vanguard FedCiv 250 List 2025
            </p>
          </div>

          <div className="footer-col badge">
            <img
              src={digitalservicescoalition}
              alt="Digital Services Coalition logo"
              className="footer-badge"
            />
            <p>
              We’re a proud founding member
              <br />
              of the Digital Services Coalition
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            &copy; 2021 – 2025 Flexion Inc. All rights reserved. Flexion® is a
            registered trademark of Flexion Inc. See our{' '}
            <a href="#">Privacy Policy</a>.
          </p>
          <p>
            Flexion Inc. is an Equal Employment Opportunity Employer{' '}
            <a href="#">Know Your Rights</a>. Flexion Inc. participates in the
            E-Verify Program <a href="#">E-Verify Notice</a>. We also want you
            to know your right to work <a href="#">English</a> |{' '}
            <a href="#">Spanish</a>.
          </p>
          <p>
            Flexion Inc. is <a href="#">ISO/IEC 27001:2013</a>,{' '}
            <a href="#">ISO/IEC 20000-1:2018</a>, and{' '}
            <a href="#">ISO 9001:2015</a> certified.
          </p>
        </div>
      </div>
    </footer>
  );
}
