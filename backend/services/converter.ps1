
param (
    [Parameter(Mandatory=$true)]
    [string]$docxPath,
    [Parameter(Mandatory=$true)]
    [string]$pdfPath
)

$ErrorActionPreference = "Stop"

try {
    Write-Host "Iniciando conversão via Word COM..."
    Write-Host "DOCX: $docxPath"
    Write-Host "PDF: $pdfPath"

    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0 # wdAlertsNone

    $doc = $word.Documents.Open($docxPath, $false, $true) # Open(FileName, ConfirmConversions, ReadOnly)
    
    # wdExportFormatPDF = 17
    # wdExportOptimizeForPrint = 0
    # wdExportAllPages = 0
    # wdExportDocumentContent = 0
    # IncludeDocProps = true
    # KeepIRM = true
    # CreateBookmarks = 0 (wdExportCreateNoBookmarks)
    # DocStructureTags = true
    # BitmapMissingFonts = true
    # UseISO19005_1 = false
    $doc.ExportAsFixedFormat($pdfPath, 17, $false, 0, 0, 1, 1, 0, $true, $true, 0, $true, $true, $false)

    $doc.Close($false) # wdDoNotSaveChanges = 0
    $word.Quit()

    # Liberar objetos COM
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($doc) | Out-Null
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()

    Write-Host "Conversão concluída com sucesso."
} catch {
    Write-Error "Erro na conversão: $($_.Exception.Message)"
    if ($word) { $word.Quit(); [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null }
    exit 1
}
