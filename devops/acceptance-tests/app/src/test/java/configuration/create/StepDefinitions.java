package configuration.create;

import io.cucumber.java.After;
import io.cucumber.java.AfterAll;
import io.cucumber.java.BeforeAll;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import utils.Command;
import utils.Constants;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class StepDefinitions {
    private Command _commandExecuted;

    @Given("The project can be created")
    public void the_folder_does_not_exists() {
        Folder folderClass = new Folder(Folder.getMagBaseFolder());
        assertTrue(folderClass.exists());
    }

    @When("I execute create command with {word} for project {word}")
    public void i_execute_create_command(String architecture, String name) {
        CreateCommand command = new CreateCommand();
        command.create(architecture, name);
    }

    @Then("a folder {word} has been created with {word}")
    public void a_new_folder_has_been_created(String folder, String architecture) {
        Folder folderClass = new Folder(Folder.getMagBaseFolder() + File.separator + folder);
        String configurationFilePath = Folder.getMagBaseFolder() + File.separator + folder + File.separator + Constants.CONFIGURATION_FILE;
        String folderArchitecture = folderClass.getArchitecture(configurationFilePath);

        assertTrue(folderClass.exists());
        assertEquals(folderArchitecture, architecture.toLowerCase());
    }

    @When("I execute create command with existent {word} project")
    public void i_execute_create_command_without_overwrite(String name){
        CreateCommand command = new CreateCommand();
        command.overWrite = "no";
        this._commandExecuted = command.create("Clean", name);
    }

    @Then("the project folder is not modified")
    public void the_folder_is_not_modified(){
        List<String> commandLogs = this._commandExecuted.getCommandLogs();
        assertFalse(commandLogs.contains("Creating folder"));
    }

    @After
    public void afterEach(){
        String magTestFolder = new File(Folder.getMagBaseFolder(), "mag-test").getAbsolutePath();
        Folder.deleteFolder(magTestFolder);
    }

    @BeforeAll
    public static void beforeAll() {
        Folder.createFolder(Folder.getMagBaseFolder());

        System.out.println("...Installing MAG...");

        List<String> arguments = new ArrayList<>();
        arguments.add("npm");
        arguments.add("install");
        arguments.add("modern-architecture-generator@latest");
        arguments.add("-g");

        Command command = new Command(arguments);
        command.execute();
    }

    @AfterAll
    public static void afterAll() {
        System.out.println("...Removing MAG...");

        List<String> arguments = new ArrayList<>();
        arguments.add("npm");
        arguments.add("uninstall");
        arguments.add("modern-architecture-generator");

        Command command = new Command(arguments);
        command.execute();

        Folder.deleteFolder(Folder.getMagBaseFolder());
    }
}
