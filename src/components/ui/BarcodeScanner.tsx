import { useEffect, useRef } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"

type Props = {
  opened: boolean
  onClose: () => void
  onDetected: (code: string) => void
  fps?: number
  qrbox?: number
}

export default function BarcodeScanner({
  opened,
  onClose,
  onDetected,
  fps = 10,
  qrbox = 250,
}: Props) {
  const mountId = "html5qr-reader"
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  useEffect(() => {
    if (!opened) return

    const scanner = new Html5QrcodeScanner(
      mountId,
      { fps, qrbox: { width: qrbox, height: qrbox } },
      false
    )

    scanner.render(
      (decodedText: string) => {
        onDetected(decodedText)
      },
      () => {
        // ignore scan errors while camera is searching
      }
    )

    scannerRef.current = scanner

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .clear()
          .catch(() => {})
          .finally(() => {
            scannerRef.current = null
          })
      }
    }
  }, [opened, fps, qrbox, onDetected])

  if (!opened) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#1f1f1f] p-4 shadow-2xl border border-white/10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Scan barcode / QR</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1 text-sm text-white hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <div id={mountId} className="w-full min-h-[320px] overflow-hidden rounded-xl bg-black" />

        <p className="mt-3 text-sm text-gray-300">
          Allow camera permission and hold the code steady in good light.
        </p>
      </div>
    </div>
  )
}