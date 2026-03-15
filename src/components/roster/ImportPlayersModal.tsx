import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, ClipboardList } from 'lucide-react'
import { Button } from '../ui/Button'
import { parseSpreadsheet, parseCSVText } from '../../services/playerImport'
import type { PlayerImportRow } from '../../types'

interface ImportPlayersModalProps {
  onImport: (rows: PlayerImportRow[]) => Promise<number>
  onClose: () => void
}

export function ImportPlayersModal({ onImport, onClose }: ImportPlayersModalProps) {
  const [mode, setMode] = useState<'file' | 'paste'>('file')
  const [pasteText, setPasteText] = useState('')
  const [preview, setPreview] = useState<PlayerImportRow[]>([])
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    try {
      const rows = await parseSpreadsheet(file)
      setPreview(rows)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file')
    }
  }

  const handlePaste = () => {
    setError(null)
    const rows = parseCSVText(pasteText)
    setPreview(rows)
  }

  const handleImport = async () => {
    if (preview.length === 0) return
    setImporting(true)
    setError(null)
    try {
      const count = await onImport(preview)
      setResult(`Successfully imported ${count} player${count !== 1 ? 's' : ''}!`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
    }
    setImporting(false)
  }

  return (
    <div className="space-y-4">
      {/* Mode Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => { setMode('file'); setPreview([]); setError(null); setResult(null) }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'file' ? 'bg-navy-500 text-white' : 'bg-cream-200 text-navy-500 hover:bg-cream-300'
          }`}
        >
          <FileSpreadsheet size={16} />
          Upload File
        </button>
        <button
          onClick={() => { setMode('paste'); setPreview([]); setError(null); setResult(null) }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'paste' ? 'bg-navy-500 text-white' : 'bg-cream-200 text-navy-500 hover:bg-cream-300'
          }`}
        >
          <ClipboardList size={16} />
          Paste Names
        </button>
      </div>

      {mode === 'file' ? (
        <div>
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-cream-300 rounded-xl p-8 text-center cursor-pointer hover:border-navy-300 hover:bg-cream-50 transition-all"
          >
            <Upload size={32} className="mx-auto text-navy-300 mb-3" />
            <p className="text-sm font-medium text-navy-600">Click to upload or drag a file</p>
            <p className="text-xs text-navy-300 mt-1">Excel (.xlsx, .xls), CSV, or Google Sheets export</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv,.tsv"
            className="hidden"
            onChange={handleFile}
          />
        </div>
      ) : (
        <div>
          <p className="text-sm text-navy-400 mb-2">
            Paste player names (one per line). Format: <code className="bg-cream-200 px-1 rounded">FirstName, LastName, Number</code>
          </p>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            className="input-field resize-none font-mono text-sm"
            rows={6}
            placeholder={`Jake, Smith, 12\nMike, Jones, 7\nTom, Brown, 24`}
          />
          <Button variant="outline" size="sm" onClick={handlePaste} className="mt-2" disabled={!pasteText.trim()}>
            Preview
          </Button>
        </div>
      )}

      {/* Preview */}
      {preview.length > 0 && !result && (
        <div>
          <h4 className="text-sm font-semibold text-navy-600 mb-2">Preview ({preview.length} players)</h4>
          <div className="max-h-48 overflow-y-auto border border-cream-300 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-cream-100 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-navy-500 font-medium">Name</th>
                  <th className="px-3 py-2 text-left text-navy-500 font-medium">#</th>
                  <th className="px-3 py-2 text-left text-navy-500 font-medium">Pos</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-t border-cream-200">
                    <td className="px-3 py-2 text-navy-700">{row.firstName} {row.lastName}</td>
                    <td className="px-3 py-2 text-navy-400">{row.jerseyNumber || '--'}</td>
                    <td className="px-3 py-2 text-navy-400">{row.preferredPositions?.join(', ') || '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2 border border-red-200">{error}</div>
      )}

      {result && (
        <div className="bg-green-50 text-green-600 text-sm rounded-lg px-3 py-2 border border-green-200">{result}</div>
      )}

      <div className="flex gap-3 justify-end pt-2">
        <Button variant="outline" onClick={onClose}>{result ? 'Done' : 'Cancel'}</Button>
        {!result && preview.length > 0 && (
          <Button variant="primary" onClick={handleImport} loading={importing}>
            Import {preview.length} Player{preview.length !== 1 ? 's' : ''}
          </Button>
        )}
      </div>
    </div>
  )
}
