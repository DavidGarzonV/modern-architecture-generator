package configuration.create;

import org.json.JSONObject;
import utils.SimpleFile;

import java.io.File;
import java.io.IOException;
import java.util.Objects;

public class Folder {
    private String _directoryPath = "";
    private static String _magBaseFolder = "";

    public Folder(String directoryPath) {
        this._directoryPath = directoryPath;
    }

    public static String getMagBaseFolder() {
        if (!Objects.equals(Folder._magBaseFolder, "")){
            return Folder._magBaseFolder;
        }else{
            try {
                Folder._magBaseFolder = Folder.createTempDirectory();
                return Folder._magBaseFolder;
            }catch (IOException e){
                System.out.println("Could not create the temporary directory");
                return "";
            }
        }
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

    public static Boolean createFolder(String directoryPath) {
        File directory = new File(directoryPath);
        if (!directory.exists()) {
            return directory.mkdirs();
        }

        return false;
    }

    public static void deleteFolder(String filePath) {
        File directory = new File(filePath);

        if (directory.isDirectory()) {
            File[] items = directory.listFiles();
            if (items != null) {
                for (File item : items) {
                    deleteFolder(String.valueOf(item));
                }
            }
        }

        if (directory.exists()) {
            directory.delete();
        }
    }

    private static String createTempDirectory() throws IOException {
        final File temp;
        temp = File.createTempFile("temp", Long.toString(System.nanoTime()));

        if(!(temp.delete()))
        {
            throw new IOException("Could not delete temp file: " + temp.getAbsolutePath());
        }

        if(!(temp.mkdir()))
        {
            throw new IOException("Could not create temp directory: " + temp.getAbsolutePath());
        }

        return temp.getAbsolutePath();
    }
}
