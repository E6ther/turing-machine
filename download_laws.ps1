$base = "https://turingmachine.info/images/laws/CNS/"
$destDir = Join-Path (Get-Location) "img/laws"
$concurrent = 20
$total = 200

$jobs = @()
1..$total | ForEach-Object {
    $id = $_
    $filename = "${id}_Mini_CNS.jpg"
    $url = "$base$filename"
    $out = Join-Path $destDir $filename
    $scriptBlock = {
        param($u, $o)
        try {
            if (-not (Test-Path $o)) {
                Invoke-WebRequest -Uri $u -OutFile $o -TimeoutSec 30 -ErrorAction Stop | Out-Null
                return "OK $([System.IO.Path]::GetFileName($o))"
            } else {
                return "SKIP $([System.IO.Path]::GetFileName($o))"
            }
        } catch {
            return "FAIL $([System.IO.Path]::GetFileName($o))"
        }
    }
    $jobs += Start-Job -ScriptBlock $scriptBlock -ArgumentList $url, $out
    if ($jobs.Count -ge $concurrent) {
        $results = $jobs | Wait-Job | Receive-Job
        $results | ForEach-Object { Write-Host $_ }
        $jobs = @()
    }
}
if ($jobs.Count -gt 0) {
    $results = $jobs | Wait-Job | Receive-Job
    $results | ForEach-Object { Write-Host $_ }
}

Remove-Job -State Completed -ErrorAction SilentlyContinue

$count = (Get-ChildItem -LiteralPath $destDir -Filter "*.jpg").Count
Write-Host "=== Done: $count files in $destDir ==="
