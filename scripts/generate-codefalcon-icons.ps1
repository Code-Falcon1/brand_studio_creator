param(
  [Parameter(Mandatory = $true)]
  [string]$SourcePng
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $SourcePng)) {
  throw "Source file not found: $SourcePng"
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$publicDir = Join-Path $repoRoot "public"
if (-not (Test-Path -LiteralPath $publicDir)) {
  throw "public/ folder not found at: $publicDir"
}

Add-Type -AssemblyName System.Drawing

function Save-ResizedPng {
  param(
    [Parameter(Mandatory = $true)] [System.Drawing.Image]$Image,
    [Parameter(Mandatory = $true)] [int]$Size,
    [Parameter(Mandatory = $true)] [string]$OutPath
  )

  $bmp = New-Object System.Drawing.Bitmap $Size, $Size
  try {
    $bmp.SetResolution($Image.HorizontalResolution, $Image.VerticalResolution)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    try {
      $g.Clear([System.Drawing.Color]::Transparent)
      $g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
      $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
      $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

      # Fit within square preserving aspect ratio
      $scale = [Math]::Min($Size / $Image.Width, $Size / $Image.Height)
      $w = [Math]::Max(1, [Math]::Round($Image.Width * $scale))
      $h = [Math]::Max(1, [Math]::Round($Image.Height * $scale))
      $x = [Math]::Round(($Size - $w) / 2)
      $y = [Math]::Round(($Size - $h) / 2)
      $g.DrawImage($Image, $x, $y, $w, $h)
    } finally {
      $g.Dispose()
    }

    $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $bmp.Dispose()
  }
}

$img = [System.Drawing.Image]::FromFile($SourcePng)
try {
  $targets = @(
    @{ Size = 16; Name = "codefalcon-16.png" },
    @{ Size = 32; Name = "codefalcon-32.png" },
    @{ Size = 192; Name = "codefalcon-192.png" },
    @{ Size = 512; Name = "codefalcon-512.png" }
  )

  foreach ($t in $targets) {
    $out = Join-Path $publicDir $t.Name
    Save-ResizedPng -Image $img -Size $t.Size -OutPath $out
    Write-Host "Wrote $out"
  }

  Write-Host "Done. Refresh the app and clear cache if icons don't update immediately."
} finally {
  $img.Dispose()
}

