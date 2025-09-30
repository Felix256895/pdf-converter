# PDF Converter

A document conversion service based on NestJS that can convert various office document formats (such as DOC, DOCX, XLS, XLSX, PPT, PPTX, etc.) to PDF format.

## Features

- Supports conversion of multiple document formats to PDF
- Asynchronous task queue processing
- File upload and download
- Simple web interface for testing
- RESTful API interface

## Tech Stack

- NestJS
- TypeScript
- LibreOffice (as conversion engine)
- Multer (file upload)

## Requirements

- Node.js >= 14
- LibreOffice >= 7.0
- pnpm (recommended) or npm

## Installation

1. Clone the project:
   ```bash
   git clone <repository-url>
   cd pdf-converter
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Then modify the configuration in the `.env` file according to your environment.

4. Ensure LibreOffice is installed and configured with the correct path.

## Configuration

Configure the following environment variables in the `.env` file:

```env
# Application configuration
PORT=3000

# File upload configuration
MAX_FILE_SIZE=52428800

# LibreOffice configuration (adjust path according to your system)
LIBREOFFICE_PATH="C:\Program Files\LibreOffice\program\soffice.exe"

# Directory configuration
UPLOAD_DIR=./uploads
TEMP_DIR=./temp
OUTPUT_DIR=./output
```

## Starting the Service

```bash
pnpm run start
```

The service will start at `http://localhost:3000`.

## Usage

### Web Interface

Visit `http://localhost:3000` to use the simple web interface to upload and convert files.

### API Interface

1. **Upload File**
   ```
   POST /upload
   Content-Type: multipart/form-data
   
   file: [file data]
   ```

2. **Query Conversion Status**
   ```
   GET /convert/status/:fileId
   ```

3. **Start Conversion** (usually done automatically after upload)
   ```
   GET /convert/start/:fileId
   ```

4. **Download PDF**
   ```
   GET /download/:fileId
   ```

## Project Structure

```
src/
├── config/              # Configuration files
├── filters/             # Global exception filters
├── modules/
│   ├── upload/          # File upload module
│   └── convert/         # Document conversion module
├── queues/              # Task queues
└── main.ts              # Application entry point
```

## Development

```bash
# Development mode
pnpm run start:dev

# Build
pnpm run build

# Production mode
pnpm run start:prod
```

## License

MIT
