# Azure deployment script for DWSSite

# Prerequisites
# - Azure CLI installed
# - Azure login credentials
# - Azure App Service plan and resource group

# Configuration
$resourceGroupName = "DWSSite-rg"
$appServiceName = "dws-portfolio"
$location = "eastus"

# Login to Azure (if not already logged in)
Write-Host "Checking Azure login..."
az account show --output none
if ($LASTEXITCODE -ne 0) {
    Write-Host "Please login to Azure..."
    az login
}

# Create resource group if it doesn't exist
Write-Host "Creating resource group if needed..."
az group create --name $resourceGroupName --location $location

# Create App Service plan if it doesn't exist
Write-Host "Creating App Service plan if needed..."
az appservice plan create --name "DWSSite-plan" --resource-group $resourceGroupName --location $location --sku B1

# Create App Service if it doesn't exist
Write-Host "Creating App Service if needed..."
az webapp create --name $appServiceName --plan "DWSSite-plan" --resource-group $resourceGroupName --runtime "NODE|18-lts"

# Configure deployment
Write-Host "Configuring deployment..."
az webapp config appsettings set --name $appServiceName --resource-group $resourceGroupName --settings WEBSITE_NODE_DEFAULT_VERSION=~18

# Deploy application
Write-Host "Deploying application..."
az webapp up --name $appServiceName --resource-group $resourceGroupName --location $location --runtime "NODE|18-lts" --os-type Linux

Write-Host "Deployment complete!"
Write-Host "Your application is available at: https://$appServiceName.azurewebsites.net"
