/**
 * Testgit
 */
import { dag, Container, Directory, object, func } from "@dagger.io/dagger"

@object()
class Testgit {
    /**
     * Returns a Container read to ls -al the /src dir from git repo
     */
    @func()
    async gitLs(repoDir?: Directory, repoStr?: string): Promise<Container> {
        var ctr:Container = dag.container().from("alpine:latest")

        if ((repoDir && repoStr) || (!repoDir && !repoStr)) {
            throw new Error("Provide exactly one arg. Either `repo-dir` or `repo-str`.")
        }
        if (repoDir) {
            ctr = ctr
            .withDirectory("/src", repoDir)
        }
        if (repoStr) {
            try {
                console.log("Trying branch `main`...")
                ctr = await ctr
                .withDirectory("/src", dag.git(repoStr).branch("main").tree())
                .sync()
            } catch (error) {
                console.error("No `main` branch...");
                try {
                    console.log("Trying branch `master`...")
                    ctr = await ctr
                    .withDirectory("/src", dag.git(repoStr).branch("master").tree())
                    .sync()
                } catch (error) {
                    throw new Error("Repo must have either `main` or `master` branch.")
                }
            }
        }
        return ctr
        .withWorkdir("/src")
        .withExec(["ls", "-alh"])
    }
}
