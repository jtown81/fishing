/**
 * Print utility functions
 */

/**
 * Open a new window with print content and trigger print dialog
 * Uses safe DOM manipulation instead of document.write
 */
export function printContent(content: HTMLElement, title: string = 'Document') {
  const printWindow = window.open('', '', 'width=800,height=600')
  if (!printWindow) {
    alert('Please disable popup blocker to print')
    return
  }

  // Create document structure safely
  const doc = printWindow.document
  const html = doc.createElement('html')
  const head = doc.createElement('head')
  const titleEl = doc.createElement('title')
  titleEl.textContent = title

  const style = doc.createElement('style')
  style.textContent = `
    @page {
      size: 8.5in 11in;
      margin: 0.5in;
    }
    body {
      font-family: Arial, sans-serif;
      line-height: 1.4;
      color: black;
      margin: 0;
      padding: 0;
    }
    * {
      box-sizing: border-box;
    }
    .no-print {
      display: none;
    }
  `

  head.appendChild(titleEl)
  head.appendChild(style)

  const body = doc.createElement('body')
  const contentClone = content.cloneNode(true) as HTMLElement
  body.appendChild(contentClone)

  html.appendChild(head)
  html.appendChild(body)
  doc.appendChild(html)

  printWindow.focus()

  // Wait for content to render, then print
  setTimeout(() => {
    printWindow.print()
  }, 250)
}

/**
 * Print element by ID
 */
export function printById(elementId: string, title: string = 'Document') {
  const element = document.getElementById(elementId)
  if (!element) {
    alert(`Element with id "${elementId}" not found`)
    return
  }
  printContent(element, title)
}

/**
 * Generate print-friendly date
 */
export function getPrintDate(): Date {
  return new Date()
}
