package configuration.create;

import utils.Command;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class CreateCommand {
    public String overWrite = "yes";
    public String testing = "no";
    public String openTheProject = "no";

    public Command create(String architecture, String name){
        List<String> commandArguments = new ArrayList<>();
        commandArguments.add("mag");
        commandArguments.add("create");
        commandArguments.add(name);

        Map<String, String> commandOptions = new HashMap<>();
        commandOptions.put(architecture, "newLine");
        commandOptions.put("testing", this.testing);
        commandOptions.put("overwrite", this.overWrite);
        commandOptions.put("open the project folder", this.openTheProject);

        Command command = new Command(commandArguments, commandOptions);
        command.execute();

        return command;
    }
}
