package utils;

import configuration.create.Folder;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.TimeUnit;

public class Command {
    private final List<String> _arguments;
    private final Map<String, Integer> _options;
    private String _executionDir;
    private Boolean _isSimpleCommand;
    private List<String> _commandLogs;

    public List<String> getCommandLogs() {
        return _commandLogs;
    }

    public Command(List<String> arguments, Map<String, Integer> options) {
        this._arguments = arguments;
        this._options = options;
        this._executionDir = Folder.getMagBaseFolder();
        this._isSimpleCommand = false;
    }

    public Command(List<String> arguments) {
        this(arguments, null);
        this._isSimpleCommand = true;
    }

    public void setExecutionDir(String executionDir) {
        this._executionDir = executionDir;
    }

    private List<String> getBaseCommands() {
        boolean isWindows = System.getProperty("os.name").toLowerCase().startsWith("win");

        List<String> commandsToExecute = new ArrayList<>();
        if (isWindows) {
            commandsToExecute.add("cmd");
            commandsToExecute.add("/c");
        }

        return commandsToExecute;
    }

    private void handleMagStream(InputStream inputStream, OutputStream outputStream, Boolean isInputStream) throws IOException {
        BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(outputStream));
        boolean handleOutputStream = isInputStream && this._options != null && !this._options.isEmpty();

        Set<String> architectureKeys = Set.of("Clean", "Onion", "Hexagonal");

        try (BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream))) {
            String line;
            while ((line = bufferedReader.readLine()) != null) {
                System.out.println(line);

                if (isInputStream){
                    this._commandLogs.add(line);
                }

                if (handleOutputStream) {
                    for (String key : this._options.keySet()) {
                        if (line.contains(key)) {

                            if (architectureKeys.contains(key)) {
                                if (key.equals("Hexagonal")){
                                    writer.write("\u001b[B");
                                } else if (key.equals("Onion")){
                                    writer.write("\u001b[B");
                                    writer.write("\u001b[B");
                                }
                            } else {
                                int character = this._options.get(key);
                                // System.out.println("Writing option "+ key + " with value " + character );
                                writer.write(character);
                            }
                            writer.newLine();
                            writer.flush();
                            break;
                        }
                    }
                }
            }
        }
    }

    public void execute() {
        List<String> commandsToExecute = this.getBaseCommands();
        this._commandLogs = new ArrayList<>();

        if (!this._arguments.isEmpty()) {
            commandsToExecute.addAll(this._arguments);
        }

        if (!this._isSimpleCommand) {
            commandsToExecute.add("-p");
            commandsToExecute.add(this._executionDir);
        }

        System.out.println("Executing command with arguments: " + commandsToExecute);

        try {

            ProcessBuilder processBuilder = new ProcessBuilder(commandsToExecute);
            Process process = processBuilder.start();

            OutputStream outputStream = process.getOutputStream();
            InputStream inputStream = process.getInputStream();
            InputStream errorStream = process.getErrorStream();

            handleMagStream(inputStream, outputStream, true);
            handleMagStream(errorStream, outputStream, false);

            boolean isFinished = process.waitFor(10, TimeUnit.SECONDS);

            inputStream.close();
            errorStream.close();
            outputStream.flush();
            outputStream.close();

            if (!isFinished) {
                process.destroyForcibly();
            }

            int exitCode = process.exitValue();
            System.out.println("Command exit code: " + exitCode);
        } catch (IOException | InterruptedException e) {
            throw new RuntimeException(e);
        }
    }
}
