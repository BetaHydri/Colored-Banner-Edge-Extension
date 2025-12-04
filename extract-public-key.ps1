# Extract public key from PEM file for Chrome/Edge extension manifest
$pemPath = ".\bin\RedBanner.pem"

# Read PEM content
$pemContent = Get-Content $pemPath -Raw

# Remove PEM headers and whitespace
$base64Key = $pemContent -replace "-----BEGIN PRIVATE KEY-----","" `
                         -replace "-----END PRIVATE KEY-----","" `
                         -replace "`n","" `
                         -replace "`r","" `
                         -replace " ",""

try {
    # Convert to bytes
    $privateKeyBytes = [System.Convert]::FromBase64String($base64Key)
    
    # Create RSA object and import the private key
    $rsa = [System.Security.Cryptography.RSA]::Create()
    $rsa.ImportPkcs8PrivateKey($privateKeyBytes, [ref]$null)
    
    # Export the public key in SubjectPublicKeyInfo format (DER)
    $publicKeyBytes = $rsa.ExportSubjectPublicKeyInfo()
    
    # Convert to Base64
    $publicKeyBase64 = [System.Convert]::ToBase64String($publicKeyBytes)
    
    Write-Host "`n✓ Public Key extracted successfully!" -ForegroundColor Green
    Write-Host "`nPublic Key (add this to manifest.json):" -ForegroundColor Cyan
    Write-Host $publicKeyBase64 -ForegroundColor Yellow
    
    # Return the key for piping
    return $publicKeyBase64
    
} catch {
    Write-Error "Failed to extract public key: $_"
    Write-Host "`nMake sure the PEM file is in PKCS#8 format." -ForegroundColor Red
}
