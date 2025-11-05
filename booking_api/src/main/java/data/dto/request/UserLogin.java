package data.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserLogin {

    @NotBlank(message = "email không được để trống")
    private String email;

    @NotBlank(message = "Password không được để trống")
    private String password;
}