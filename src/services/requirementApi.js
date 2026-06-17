const API_URL = import.meta.env.VITE_API_URL;


// Get all requirements
export const getRequirements = async () => {
    const response = await fetch(
        `${API_URL}/requirements`,
        {
            credentials: "include"
        }
    );

    return response.json();
};


// Create requirement
export const createRequirement = async (data) => {
    const response = await fetch(
        `${API_URL}/requirements`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(data)
        }
    );

    return response.json();
};


// Get single requirement
export const getRequirementById = async (id) => {
    const response = await fetch(
        `${API_URL}/requirements/${id}`,
        {
            credentials: "include"
        }
    );

    return response.json();
};


// Update requirement
export const updateRequirement = async (id, data) => {
    const response = await fetch(
        `${API_URL}/requirements/${id}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(data)
        }
    );

    return response.json();
};


// Delete requirement
export const deleteRequirement = async (id) => {
    const response = await fetch(
        `${API_URL}/requirements/${id}`,
        {
            method: "DELETE",
            credentials: "include"
        }
    );

    return response.json();
};