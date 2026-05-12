from schemas import Operation
from services.operations.brightness import apply_brightness
from services.operations.edge_detection import apply_edge_detection
from services.operations.histogram_eq import apply_histogram_equalization
from services.operations.histogram_spec import apply_histogram_specification
from services.operations.rotate import apply_rotate

REGISTRY = {
    "brightness": apply_brightness,
    "edge_detection": apply_edge_detection,
    "histogram_equalization": apply_histogram_equalization,
    "histogram_specification": apply_histogram_specification,
    "rotate": apply_rotate
}


def apply_pipeline(image,operations : list[Operation]):
    for op in operations:
        if op.type not in REGISTRY:
            raise KeyError(op.type)
        image = REGISTRY[op.type](image, **op.params)
    return image