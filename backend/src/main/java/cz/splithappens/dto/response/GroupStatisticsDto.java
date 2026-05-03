package cz.splithappens.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@Schema(description = "Aggregated statistics for a group")
public class GroupStatisticsDto {
    // Intentionally left empty (skeleton)
}


