package configuration.create;

import io.cucumber.java.After;
import io.cucumber.java.AfterAll;
import io.cucumber.java.BeforeAll;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import utils.Command;
import utils.Constants;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class StepDefinitions {
    private static final String MAG_TEST_FOLDER = Constants.MAG_BASE_FOLDER + "/mag-test";

    @Given("The folder {word} does not exists")
    public void the_folder_does_not_exists(String folder) {
        Folder folderClass = new Folder(Constants.MAG_BASE_FOLDER + "/" + folder);
        assertFalse(folderClass.exists());
    }

    @When("I execute create command with {word} for project {word}")
    public void i_execute_create_command(String architecture, String name) {
        CreateCommand.create(architecture, name);
    }

    @Then("a folder {word} has been created with {word}")
    public void a_new_folder_has_been_created(String folder, String architecture) {
        Folder folderClass = new Folder(Constants.MAG_BASE_FOLDER + "/" + folder);
        String configurationFilePath = Constants.MAG_BASE_FOLDER + "/" + folder + "/" + Constants.CONFIGURATION_FILE;
        String folderArchitecture = folderClass.getArchitecture(configurationFilePath);

        assertTrue(folderClass.exists());
        assertEquals(folderArchitecture, architecture.toLowerCase());
    }

    @After
    public void afterEach(){
        Folder.deleteFolder(StepDefinitions.MAG_TEST_FOLDER);
    }

    @BeforeAll
    public static void beforeAll() {
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
    }
}
