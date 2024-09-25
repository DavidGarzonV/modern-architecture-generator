package configuration.create;

import utils.Command;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class CreateCommand {
    public static void create(String architecture, String name){
        List<String> commandArguments = new ArrayList<>();
        commandArguments.add("mag");
        commandArguments.add("create");
        commandArguments.add(name);

        Map<String, String> commandOptions = new HashMap<>();
        commandOptions.put(architecture, "newLine");
        commandOptions.put("testing", "no");
        commandOptions.put("overwrite", "yes");
        commandOptions.put("open the project folder", "no");

        Command command = new Command(commandArguments, commandOptions);
        command.execute();
    }
}
