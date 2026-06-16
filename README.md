


# Graphix ✨

A modern, interactive graph visualization and creation tool built with Next.js. Graphix allows users to create, customize, and explore graph structures with an intuitive drag-and-drop interface.

## 🚀 Features

- **Interactive Canvas** - Drag-and-drop interface for creating nodes and edges
- **Customizable Nodes** - Modify node colors, sizes, labels, and styles
- **Multiple Layout Algorithms** - Apply force-directed, circular, grid, and other layout algorithms
- **Real-time Graph Manipulation** - Add, remove, and connect nodes dynamically
- **Export/Import** - Save and load graphs in various formats (JSON, PNG, SVG)
- **Graph Analysis** - View graph properties like node degrees, connectivity, and more
- **Responsive Design** - Works seamlessly across desktop and mobile devices
- **Dark Mode** - Toggle between light and dark themes for comfortable viewing

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS
- **Canvas/SVG Manipulation**: (Add specific library if used, e.g., D3.js, Cytoscape.js, React Flow)
- **State Management**: React Context / Zustand / Redux (specify which one is used)
- **Deployment**: Vercel

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AbdullahSalimee/graphix.git
   cd graphix
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Configure any necessary environment variables in `.env.local`

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎯 Usage

### Creating a Graph
1. Click on the canvas to add nodes
2. Drag between nodes to create edges/connections
3. Double-click nodes to edit their properties
4. Use the toolbar to access different tools and options

### Customization
- **Node Settings**: Modify color, size, label, and shape
- **Edge Settings**: Adjust thickness, style (solid/dashed), and direction
- **Layout Options**: Choose from various automatic layout algorithms

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Y` | Redo |
| `Delete` | Remove selected element |
| `Ctrl/Cmd + A` | Select all |
| `Ctrl/Cmd + S` | Save graph |
| `Space + Drag` | Pan canvas |

## 📁 Project Structure

```
graphix/
├── app/                 # Next.js app directory
├── components/          # React components
│   ├── canvas/         # Graph canvas components
│   ├── toolbar/        # Toolbar and tools
│   └── ui/             # UI components
├── lib/                # Utility functions and helpers
├── hooks/              # Custom React hooks
├── styles/             # Global styles
├── types/              # TypeScript type definitions
└── public/             # Static assets
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run end-to-end tests
npm run test:e2e

# Run tests in watch mode
npm run test:watch
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Abdullah Salimee**
- GitHub: [@AbdullahSalimee](https://github.com/AbdullahSalimee)

## 🌟 Acknowledgments

- Inspiration from various graph visualization tools
- The open-source community for amazing libraries and tools
- All contributors who have helped shape this project

## 📸 Screenshots

<!-- Add screenshots of your application here -->
<!-- 
![Dashboard](screenshots/dashboard.png)
![Graph Editor](screenshots/editor.png)
-->

## 🚧 Roadmap

- [ ] Collaborative editing support
- [ ] More layout algorithms
- [ ] Advanced analytics and metrics
- [ ] Plugin system for custom tools
- [ ] Mobile app version
- [ ] API for programmatic graph creation

## 💬 Support

For support, please open an issue in the GitHub issue tracker or contact the maintainer directly.

---

Made with ❤️ and lots of ☕
```

**Note**: I've made some assumptions about the features and tech stack since I can't access the actual repository content. You may want to:

1. Verify the actual tech stack being used (React Flow, D3.js, Cytoscape.js, etc.)
2. Add actual screenshots if available
3. Update the project structure to match your actual folder organization
4. Add or remove features based on what's actually implemented
5. Update keyboard shortcuts based on your implementation
6. Add actual environment variables if any are needed

Would you like me to help you customize any specific section based on the actual repository contents?
