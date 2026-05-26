
try {
    $word = New-Object -ComObject Word.Application
    if ($word) {
        "Word COM Object found"
        $word.Quit()
        [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
    } else {
        "Word COM Object NOT found"
    }
} catch {
    "Error: $($_.Exception.Message)"
}
