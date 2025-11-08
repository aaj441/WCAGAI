import { type ScanResult } from '../types';

interface ScanResultsProps {
  result: ScanResult;
}

export function ScanResults({ result }: ScanResultsProps) {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Scan Results</h1>
        <div className="mt-2 flex items-center">
          <span className="text-sm text-gray-500">
            {new Date(result.timestamp).toLocaleString()}
          </span>
          <span className="mx-2 text-gray-300">•</span>
          <a 
            href={result.url} 
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline"
          >
            {result.url}
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-4 bg-white rounded-lg border">
          <h2 className="text-lg font-semibold text-gray-900">Violations</h2>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {result.violations.length}
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg border">
          <h2 className="text-lg font-semibold text-gray-900">Status</h2>
          <p className="mt-2 text-3xl font-bold capitalize text-blue-600">
            {result.status}
          </p>
        </div>

        {result.keywords && (
          <div className="p-4 bg-white rounded-lg border">
            <h2 className="text-lg font-semibold text-gray-900">Keywords</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {result.keywords.map((keyword, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 text-sm bg-gray-100 rounded-full"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}