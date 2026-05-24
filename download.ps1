$base = "https://turingmachine.info/images/criteriacards/CNS/TM_GameCards_CNS-"
$dest = "img"
$total = 48
$success = 0
$skip = 0
$fail = 0

1..$total | ForEach-Object {
    $id = "{0:D2}" -f $_
    $filename = "TM_GameCards_CNS-$id.png"
    $out = Join-Path $dest $filename

    if (Test-Path $out) {
        Write-Host "[SKIP] $filename already exists"
        $skip++
        return
    }

    $url = "$base$id.png"
    try {
        Write-Host "($([string]$_).PadLeft(2)) $url ..." -NoNewline
        Invoke-WebRequest -Uri $url -OutFile $out -TimeoutSec 30 -ErrorAction Stop
        Write-Host " OK"
        $success++
    } catch {
        Write-Host " FAIL ($($_.Exception.Message))"
        $fail++
    }
}

Write-Host ""
Write-Host "=== Done: $success downloaded, $skip skipped, $fail failed ==="
