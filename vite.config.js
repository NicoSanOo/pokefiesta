import restart from 'vite-plugin-restart'

export default {
    root: 'src/', // Sources files (typically where index.html is)
    base: '',
    publicDir: '../static', // Path from project root to static assets
    server: {
        host: true, // Open to local network and display URL
        open: !('SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env) // Open if it's not a CodeSandbox
    },
    build: {
        outDir: '../dist', // Output in the dist/ folder
        emptyOutDir: true, // Empty the folder first
        sourcemap: true, // Add sourcemap
        assetsDir: 'assets' // Directory to nest generated assets under
    },
    plugins: [
        restart({ restart: ['../static/**'] }) // Restart server on static file change
    ]
}