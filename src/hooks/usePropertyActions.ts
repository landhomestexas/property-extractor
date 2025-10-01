import { useSavedStore } from "@/stores/savedStore";

export const usePropertyActions = () => {
  const { save, unsave } = useSavedStore();

  const handleSaveProperty = async (propertyId: number) => {
    const result = await save(propertyId);
    return {
      success: result.success,
      message: result.success
        ? result.alreadySaved
          ? "Property is already saved"
          : "Property saved successfully"
        : result.message || "Failed to save property",
    };
  };

  const handleUnsaveProperty = async (propertyId: number) => {
    const result = await unsave(propertyId);
    return {
      success: result.success,
      message: result.success
        ? "Property removed from saved"
        : result.message || "Failed to unsave property",
    };
  };

  const handleSaveAll = async (properties: Array<{ id: number }>) => {
    if (properties.length === 0) return { success: false, message: "No properties to save" };

    let savedCount = 0;
    let alreadySavedCount = 0;
    let errorCount = 0;

    for (const property of properties) {
      const result = await save(property.id);
      if (result.success) {
        if (result.alreadySaved) {
          alreadySavedCount++;
        } else {
          savedCount++;
        }
      } else {
        errorCount++;
      }
    }

    let message = "";
    if (errorCount === 0) {
      if (alreadySavedCount === properties.length) {
        message = "All properties were already saved";
      } else if (savedCount > 0 && alreadySavedCount > 0) {
        message = `${savedCount} properties saved, ${alreadySavedCount} were already saved`;
      } else {
        message = `${savedCount} properties saved successfully`;
      }
    } else {
      message = `${savedCount} saved, ${errorCount} failed`;
    }

    return { success: errorCount === 0, message };
  };

  return {
    handleSaveProperty,
    handleUnsaveProperty,
    handleSaveAll,
  };
};
