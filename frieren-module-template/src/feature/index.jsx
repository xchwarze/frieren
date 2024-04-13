/*
If you are reading this is because you want to develop a module!

Basically what you have to do is:
0. Clone the repository and install the `frieren-front` and `frieren-module-template` dependencies using the `yarn install` command.
1. Create a new feature in the `frieren-front` project. Use the `@module` alias to make that new feature completely isolated.
2. Open the console while in the `frieren-module-template` directory and run the `yarn wizard` command. The wizard will guide you through the process.
3. Copy the feature you left isolated in the `frieren-front` project to `frieren-module-template` and connect it to the `entry.jsx`.
4. In the `frieren-module-template` project, run the `yarn build` command to build the module.
5. Rename the folder to the name of the module and upload it to Github.

Happy coding!
*/
const DemoPage = () => (
    <div className="text-center my-5">
        <h1 className="mb-3">Demo Module</h1>
        <p className="mb-4">This is a JavaScript UMD module that loads at runtime. For more information you can check the documentation and view the source code.</p>
        <div className="ratio ratio-16x9 mx-auto">
            <iframe
                className="embed-responsive-item"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?si=2bDQQE8CqXyS-713"
                title="YouTube video player" frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin" allowFullScreen
            />
        </div>
    </div>
);

export default DemoPage;
