import { type Violation } from '../types';

interface ViolationCardProps {
  violation: Violation;
  onFix?: (fix: string) => void;
}

export function ViolationCard({ violation, onFix }: ViolationCardProps) {
  const impactColors = {
    critical: 'bg-red-100 text-red-800',
    serious: 'bg-orange-100 text-orange-800',
    moderate: 'bg-yellow-100 text-yellow-800',
    minor: 'bg-blue-100 text-blue-800'
  };

  return (
    <div className="p-4 mb-4 border rounded-lg shadow-sm">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold">{violation.id}</h3>
        <span className={`px-2 py-1 text-sm rounded ${impactColors[violation.impact]}`}>
          {violation.impact}
        </span>
      </div>
      <p className="mt-2 text-gray-700">{violation.description}</p>
      
      {violation.nodes && violation.nodes.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700">Affected Elements:</h4>
          {violation.nodes.map((node, index) => (
            <pre key={index} className="p-2 mt-2 text-sm bg-gray-50 rounded overflow-x-auto">
              {node.html}
            </pre>
          ))}
        </div>
      )}

      {violation.fixes && violation.fixes.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700">Suggested Fixes:</h4>
          <div className="mt-2 space-y-2">
            {violation.fixes.map((fix, index) => (
              <button
                key={index}
                onClick={() => onFix?.(fix)}
                className="block w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 rounded transition"
              >
                {fix}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}