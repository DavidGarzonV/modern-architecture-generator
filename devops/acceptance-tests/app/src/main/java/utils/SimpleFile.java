package utils;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

public class SimpleFile {
    public static String getFileContent(String filePath) {
        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
            StringBuilder content = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                content.append(line).append("\n");
            }

            return content.toString();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
