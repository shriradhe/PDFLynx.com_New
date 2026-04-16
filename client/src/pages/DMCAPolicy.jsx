import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function DMCAPolicy() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 mb-8 transition-colors">
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Home
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 sm:p-12 border-brand-500/20"
        >
          <div className="mb-12 border-b border-slate-200 dark:border-white/10 pb-8">
            <span className="section-label mb-3 block">Copyright Protection</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              DMCA <span className="text-gradient">Policy</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Last updated: April 15, 2026
            </p>
            {/* DMCA Badge */}
            <div className="mt-6">
              <a
                href="//www.dmca.com/Protection/Status.aspx?ID=8de9fbf6-6a5b-47d1-a5b4-94b70d25f55c"
                title="DMCA.com Protection Status"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://images.dmca.com/Badges/dmca_protected_sml_120m.png?ID=8de9fbf6-6a5b-47d1-a5b4-94b70d25f55c"
                  alt="DMCA.com Protection Status"
                  className="h-8"
                />
              </a>
            </div>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white prose-a:text-brand-600 dark:prose-a:text-brand-400 hover:prose-a:text-brand-500">
            <h2>1. Introduction</h2>
            <p>
              PDFLynx respects the intellectual property rights of others and expects its users to do the same. In accordance with the <strong>Digital Millennium Copyright Act of 1998 (DMCA)</strong>, we will respond promptly to claims of copyright infringement committed using the PDFLynx service that are reported to our designated copyright agent.
            </p>

            <h2>2. Copyright Infringement Notification</h2>
            <p>
              If you are a copyright owner or authorized to act on behalf of one, and you believe that your copyrighted work has been copied in a way that constitutes copyright infringement occurring on or through PDFLynx, please submit a notification pursuant to the DMCA by providing our Copyright Agent with the following information in writing:
            </p>
            <ol>
              <li>
                <strong>Identification of the copyrighted work</strong> that you claim has been infringed, or if multiple copyrighted works are covered by a single notification, a representative list of such works.
              </li>
              <li>
                <strong>Identification of the material</strong> that is claimed to be infringing or to be the subject of infringing activity and that is to be removed or access to which is to be disabled, and information reasonably sufficient to permit PDFLynx to locate the material.
              </li>
              <li>
                <strong>Your contact information</strong>, including your name, address, telephone number, and email address.
              </li>
              <li>
                <strong>A statement by you</strong> that you have a good faith belief that the use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.
              </li>
              <li>
                <strong>A statement</strong> that the information in the notification is accurate, and under penalty of perjury, that you are authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.
              </li>
              <li>
                <strong>A physical or electronic signature</strong> of a person authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.
              </li>
            </ol>

            <h2>3. Designated Copyright Agent</h2>
            <p>
              Please send all DMCA notices and correspondence to our Designated Copyright Agent:
            </p>
            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-6 not-prose mb-6">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong className="text-slate-900 dark:text-white">PDFLynx — Copyright Agent</strong><br />
                Email: <a href="mailto:dmca@pdflynx.com" className="text-brand-600 dark:text-brand-400 hover:underline">dmca@pdflynx.com</a><br />
                Subject Line: <em>DMCA Takedown Request</em>
              </p>
            </div>

            <h2>4. Counter-Notification</h2>
            <p>
              If you believe that your content was removed or disabled by mistake or misidentification, you may file a <strong>counter-notification</strong> containing the following:
            </p>
            <ol>
              <li>
                <strong>Identification of the material</strong> that has been removed or to which access has been disabled, and the location at which the material appeared before it was removed or access was disabled.
              </li>
              <li>
                <strong>A statement under penalty of perjury</strong> that you have a good faith belief that the material was removed or disabled as a result of mistake or misidentification of the material to be removed or disabled.
              </li>
              <li>
                <strong>Your name, address, and telephone number</strong>, and a statement that you consent to the jurisdiction of the federal district court for the judicial district in which your address is located (or, if outside the United States, any judicial district in which PDFLynx may be found), and that you will accept service of process from the person who provided notification of the alleged infringement.
              </li>
              <li>
                <strong>Your physical or electronic signature.</strong>
              </li>
            </ol>
            <p>
              If a counter-notification is received by the Copyright Agent, PDFLynx will send a copy of the counter-notification to the original complaining party informing them that PDFLynx may replace the removed material or cease disabling it within 10 to 14 business days. Unless the original complainant files an action seeking a court order against the content provider, the removed material may be replaced within 10 to 14 business days after receipt of the counter-notification, at PDFLynx's sole discretion.
            </p>

            <h2>5. Repeat Infringers</h2>
            <p>
              In accordance with the DMCA and other applicable law, PDFLynx has adopted a policy of terminating, in appropriate circumstances and at PDFLynx's sole discretion, users who are deemed to be <strong>repeat infringers</strong>. PDFLynx may also, at its sole discretion, limit access to the service and/or terminate the accounts of any users who infringe any intellectual property rights of others, whether or not there is any repeat infringement.
            </p>

            <h2>6. File Processing Disclaimer</h2>
            <p>
              PDFLynx is an automated PDF processing platform. Files uploaded to our service are processed automatically without human review. Any files that are uploaded remain on our servers for a <strong>maximum of 30 minutes</strong> before being permanently deleted. PDFLynx does not monitor, screen, or verify the content of files uploaded by users.
            </p>
            <p>
              Users are solely responsible for ensuring they have the necessary rights and permissions to process any documents through our platform. By using PDFLynx, you represent and warrant that you own or have authorization to process all content you upload.
            </p>

            <h2>7. Good Faith</h2>
            <p>
              Please note that under Section 512(f) of the DMCA, any person who knowingly materially misrepresents that material or activity is infringing may be subject to liability for damages, including costs and attorneys' fees incurred by PDFLynx or any affected party.
            </p>

            <h2>8. Modifications to This Policy</h2>
            <p>
              PDFLynx reserves the right to modify this DMCA Policy at any time. Any changes will be posted on this page with an updated revision date. Your continued use of our service after any modification to this policy constitutes acceptance of the modified policy.
            </p>

            <h2>9. Contact Us</h2>
            <p>
              If you have any questions about this DMCA Policy or our copyright practices, please contact us at <a href="mailto:dmca@pdflynx.com">dmca@pdflynx.com</a> or visit our <Link to="/contact-us">Contact Us</Link> page.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
