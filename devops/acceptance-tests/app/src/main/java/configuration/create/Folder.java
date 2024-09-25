package configuration.create;

import org.json.JSONObject;
import utils.SimpleFile;

import java.io.File;

public class Folder {
    private String _directoryPath = "";

    public Folder(String directoryPath) {
        this._directoryPath = directoryPath;
    }

    public Boolean exists() {
        File directory = new File(this._directoryPath);
        return directory.exists();
    }

    public String getArchitecture(String filePath) {
        System.out.println("Getting configuration file -> " + filePath);

        if (new File(filePath).exists()) {
            String jsonString = SimpleFile.getFileContent(filePath);
            JSONObject obj = new JSONObject(jsonString);

            return obj.getString("architecture");
        } else {
            System.out.println("The configuration file doesn't exists");
            return "";
        }
    }

    public static void deleteFolder(String filePath) {
        File directory = new File(filePath);

        if (directory.isDirectory()) {
            File[] items = directory.listFiles();
            assert items != null;
            for (File item : items) {
                deleteFolder(String.valueOf(item));
            }
        }

        if (directory.exists()) {
            directory.delete();
        }
    }
}
