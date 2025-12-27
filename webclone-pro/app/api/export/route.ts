import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import archiver from 'archiver'
import { Readable } from 'stream'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { projectId, format = 'zip' } = body

    // Fetch project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', session.user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Fetch clone data
    const { data: clone, error: cloneError } = await supabase
      .from('clones')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (cloneError || !clone) {
      return NextResponse.json(
        { error: 'Clone data not found' },
        { status: 404 }
      )
    }

    // Export based on format
    if (format === 'zip') {
      return exportAsZip(project, clone)
    } else if (format === 'react') {
      return exportAsReact(project, clone)
    } else if (format === 'nextjs') {
      return exportAsNextJS(project, clone)
    } else if (format === 'vue') {
      return exportAsVue(project, clone)
    } else {
      return NextResponse.json(
        { error: 'Unsupported export format' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    )
  }
}

async function exportAsZip(project: any, clone: any) {
  // Create a zip archive
  const archive = archiver('zip', {
    zlib: { level: 9 }
  })

  const chunks: Buffer[] = []
  
  archive.on('data', (chunk) => {
    chunks.push(Buffer.from(chunk))
  })

  archive.on('error', (err) => {
    throw err
  })

  // Add HTML files
  if (clone.html_content) {
    archive.append(clone.html_content, { name: 'index.html' })
  }

  // Add CSS
  if (clone.styles) {
    archive.append(clone.styles, { name: 'styles/main.css' })
  }

  // Add JavaScript
  if (clone.scripts) {
    archive.append(clone.scripts, { name: 'js/main.js' })
  }

  // Add metadata
  archive.append(JSON.stringify({
    project: project.name,
    originalUrl: project.original_url,
    clonedAt: clone.created_at,
    version: '1.0.0'
  }, null, 2), { name: 'metadata.json' })

  // Add README
  archive.append(`# ${project.name}

## About
This is a cloned website from ${project.original_url}

## Description
${project.description || 'No description provided'}

## Clone Information
- Cloned at: ${new Date(clone.created_at).toLocaleString()}
- Status: ${clone.status}
- Version: 1.0.0

## Usage
1. Extract all files
2. Open index.html in a web browser
3. Or serve with any static web server

## Credits
Cloned with WebClone Pro 2026
`, { name: 'README.md' })

  await archive.finalize()

  const buffer = Buffer.concat(chunks)
  
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${project.name.replace(/[^a-z0-9]/gi, '_')}_clone.zip"`
    }
  })
}

async function exportAsReact(project: any, clone: any) {
  // Create React component structure
  const componentCode = `import React from 'react';
import './styles.css';

const ${toPascalCase(project.name)}Component = () => {
  return (
    <div className="cloned-website">
      ${clone.html_content || '<div>Loading...</div>'}
    </div>
  );
};

export default ${toPascalCase(project.name)}Component;
`

  const packageJson = {
    name: project.name.toLowerCase().replace(/[^a-z0-9]/gi, '-'),
    version: '1.0.0',
    private: true,
    dependencies: {
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
      'react-scripts': '5.0.1'
    },
    scripts: {
      start: 'react-scripts start',
      build: 'react-scripts build',
      test: 'react-scripts test',
      eject: 'react-scripts eject'
    }
  }

  // Create zip with React project structure
  const archive = archiver('zip', { zlib: { level: 9 }})
  const chunks: Buffer[] = []
  
  archive.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
  
  archive.append(JSON.stringify(packageJson, null, 2), { name: 'package.json' })
  archive.append(componentCode, { name: 'src/components/ClonedWebsite.jsx' })
  archive.append(clone.styles || '', { name: 'src/components/styles.css' })
  archive.append(getReactAppFile(project.name), { name: 'src/App.js' })
  archive.append(getReactIndexFile(), { name: 'src/index.js' })
  archive.append(getReactIndexHtml(project.name), { name: 'public/index.html' })

  await archive.finalize()
  
  const buffer = Buffer.concat(chunks)
  
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${project.name.replace(/[^a-z0-9]/gi, '_')}_react.zip"`
    }
  })
}

async function exportAsNextJS(project: any, clone: any) {
  const pageCode = `export default function ${toPascalCase(project.name)}Page() {
  return (
    <div className="cloned-website">
      ${clone.html_content || '<div>Loading...</div>'}
    </div>
  );
}
`

  const packageJson = {
    name: project.name.toLowerCase().replace(/[^a-z0-9]/gi, '-'),
    version: '1.0.0',
    private: true,
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      lint: 'next lint'
    },
    dependencies: {
      next: '^14.0.0',
      react: '^18.2.0',
      'react-dom': '^18.2.0'
    }
  }

  const archive = archiver('zip', { zlib: { level: 9 }})
  const chunks: Buffer[] = []
  
  archive.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
  
  archive.append(JSON.stringify(packageJson, null, 2), { name: 'package.json' })
  archive.append(pageCode, { name: 'app/page.tsx' })
  archive.append(getNextLayoutFile(project.name), { name: 'app/layout.tsx' })
  archive.append(clone.styles || '', { name: 'app/globals.css' })
  
  await archive.finalize()
  
  const buffer = Buffer.concat(chunks)
  
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${project.name.replace(/[^a-z0-9]/gi, '_')}_nextjs.zip"`
    }
  })
}

async function exportAsVue(project: any, clone: any) {
  const componentCode = `<template>
  <div class="cloned-website">
    ${clone.html_content || '<div>Loading...</div>'}
  </div>
</template>

<script>
export default {
  name: '${toPascalCase(project.name)}Component'
}
</script>

<style scoped>
${clone.styles || ''}
</style>
`

  const packageJson = {
    name: project.name.toLowerCase().replace(/[^a-z0-9]/gi, '-'),
    version: '1.0.0',
    private: true,
    scripts: {
      serve: 'vue-cli-service serve',
      build: 'vue-cli-service build',
      lint: 'vue-cli-service lint'
    },
    dependencies: {
      'core-js': '^3.8.3',
      'vue': '^3.2.13'
    },
    devDependencies: {
      '@vue/cli-service': '^5.0.0'
    }
  }

  const archive = archiver('zip', { zlib: { level: 9 }})
  const chunks: Buffer[] = []
  
  archive.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
  
  archive.append(JSON.stringify(packageJson, null, 2), { name: 'package.json' })
  archive.append(componentCode, { name: 'src/components/ClonedWebsite.vue' })
  archive.append(getVueAppFile(project.name), { name: 'src/App.vue' })
  archive.append(getVueMainFile(), { name: 'src/main.js' })
  
  await archive.finalize()
  
  const buffer = Buffer.concat(chunks)
  
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${project.name.replace(/[^a-z0-9]/gi, '_')}_vue.zip"`
    }
  })
}

// Helper functions
function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

function getReactAppFile(projectName: string): string {
  return `import './App.css';
import ClonedWebsite from './components/ClonedWebsite';

function App() {
  return (
    <div className="App">
      <ClonedWebsite />
    </div>
  );
}

export default App;`
}

function getReactIndexFile(): string {
  return `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`
}

function getReactIndexHtml(projectName: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${projectName} - Cloned with WebClone Pro</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`
}

function getNextLayoutFile(projectName: string): string {
  return `import './globals.css'

export const metadata = {
  title: '${projectName} - Cloned with WebClone Pro',
  description: 'Generated by WebClone Pro 2026',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`
}

function getVueAppFile(projectName: string): string {
  return `<template>
  <div id="app">
    <ClonedWebsite />
  </div>
</template>

<script>
import ClonedWebsite from './components/ClonedWebsite.vue'

export default {
  name: 'App',
  components: {
    ClonedWebsite
  }
}
</script>`
}

function getVueMainFile(): string {
  return `import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`
}