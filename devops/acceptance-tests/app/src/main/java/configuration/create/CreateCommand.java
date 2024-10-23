package configuration.create;

import utils.Command;
import utils.Constants;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class CreateCommand {
    public Integer overWrite = Constants.ASCII_YES;
    public Integer testing = Constants.ASCII_NO;
    public Integer openTheProject = Constants.ASCII_NO;

    public Command create(String architecture, String name){
        List<String> commandArguments = new ArrayList<>();
        commandArguments.add("mag");
        commandArguments.add("create");
        commandArguments.add(name);

        Map<String, Integer> commandOptions = new HashMap<>();
        commandOptions.put(architecture, 0);
        commandOptions.put("testing", this.testing);
        commandOptions.put("overwrite", this.overWrite);
        commandOptions.put("open the project folder", this.openTheProject);

        Command command = new Command(commandArguments, commandOptions);
        command.execute();

        return command;
    }
}
