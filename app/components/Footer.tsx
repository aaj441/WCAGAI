export function Footer() {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              About
            </h3>
            <p className="mt-4 text-base text-gray-500">
              WCAG AI helps you identify and fix accessibility issues in your web applications
              using advanced AI technology.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Resources
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="https://www.w3.org/WAI/standards-guidelines/wcag/" 
                   className="text-base text-gray-500 hover:text-gray-900"
                   target="_blank"
                   rel="noopener noreferrer">
                  WCAG Guidelines
                </a>
              </li>
              <li>
                <a href="https://www.w3.org/WAI/WCAG21/quickref/" 
                   className="text-base text-gray-500 hover:text-gray-900"
                   target="_blank"
                   rel="noopener noreferrer">
                  Quick Reference
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Legal
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="/privacy" className="text-base text-gray-500 hover:text-gray-900">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-base text-gray-500 hover:text-gray-900">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; {new Date().getFullYear()} WCAG AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}